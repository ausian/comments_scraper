import './App.css';
import React, { useState, useContext, useEffect } from 'react';
import Section from './components/Section/section';
import { Menu, ConfigProvider, Input, Space, Button, List, Card, message } from 'antd';
import CustomList from './components/CustomList/CustomList';
import GlobalContext from './context/globalContext';
import axios from 'axios';

function App() {
  const { sources, data, dataWebUrls, createWebUrl, deleteWebUrl, fetchWebUrls, fetchData } = useContext(GlobalContext);
  const [newUrl, setNewUrl] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL;

  console.log(data)
  console.log(dataWebUrls)

  const handleAddUrl = () => {
    if (newUrl.trim() !== '' && selectedSourceId) {
      createWebUrl({ sourceId: selectedSourceId, url: newUrl });
      setNewUrl('');
    }
  };

  const handleMenuClick = (e) => {
    const sourceId = parseInt(e.key, 10);
    setSelectedSourceId(sourceId);
  };

  const handleParsing = async () => {
    if (!selectedSourceId) {
      message.error('Please select a source first.');
      return;
    }
    try {
      await axios.post(`${apiUrl}/parse`, { sourceId: selectedSourceId });
      message.success('Parsing completed successfully.');
      fetchData(selectedSourceId);  // Refresh data after parsing
    } catch (error) {
      console.error('Error during parsing:', error);
      message.error('Error during parsing.');
    }
  };

  useEffect(() => {
    if (selectedSourceId !== null) {
      fetchWebUrls(selectedSourceId);
      fetchData(selectedSourceId);
    }
  }, [selectedSourceId, fetchWebUrls, fetchData]);

  const menuItems = sources.map(source => ({
    key: source.id,
    label: source.name,
  }));

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemBg: 'var(--color-bg)',
            itemColor: 'var(--color-font)',
            itemHoverBg: 'var(--color-elem)',
            popupBg: 'var(--color-bg)',
            itemHoverColor: 'var(--color-font)',
            groupTitleColor: 'var(--color-font)',
            itemActiveBg: 'var(--color-elem)',
            itemSelectedBg: 'var(--color-elem)',
            itemSelectedColor: 'var(--color-font)',
          },
          List: {
            itemPaddingLG: '10px 10px'
          },
          Input: {
            activeBg: 'var(--color-elem)',
          },
        },
        token: {
          colorText: 'var(--color-font)',
          colorBorder: 'var(--color-elem-border)'
        },
      }}
    >
      <div className="layout">
        <Section name='Источник'>
          <Menu
            onClick={handleMenuClick}
            style={{ width: '100%' }}
            mode="vertical"
            items={menuItems}
          />
          <Button type="primary" onClick={handleParsing}  style={{width: '100%'}}>Парсинг</Button>
        </Section>
        <Section name='WebURLs'>
          <Space.Compact style={{ width: '100%' }}>
            <Input 
              placeholder='Ссылка на страницу'
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              style={{ background: 'var(--color-elem)', color: 'var(--color-font)' }}
            />
            <Button type="primary" onClick={handleAddUrl}>Добавить</Button>
          </Space.Compact>
          <CustomList data={dataWebUrls} onDelete={deleteWebUrl} />
        </Section>
        <Section name='Данные'>
          <div className='sectionSubConteiner'>
          <List
  grid={{ gutter: 16, column: 4 }}
  dataSource={data}
  renderItem={(item) => {
    // Найдите соответствующий URL для текущего элемента
    const matchingUrl = dataWebUrls.find((url) => url.id === item.webUrlId);

    return (
      <List.Item key={item.id}>
        <Card
          style={{ background: 'var(--color-elem)', borderColor: 'var(--color-elem-border)' }}
          title={item.author}
        >
          <p>{item.text}</p>
          {/* Отобразите найденный URL, если он существует */}
          {matchingUrl && (
            <a href={matchingUrl.url} target="_blank" rel="noopener noreferrer">
              {matchingUrl.url}
            </a>
          )}
        </Card>
      </List.Item>
    );
  }}
/>
          </div>
        </Section>
      </div>
    </ConfigProvider>
  );
}

export default App;
