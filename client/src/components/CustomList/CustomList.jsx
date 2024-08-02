import style from './CustomList.module.css';
import { Input, Space, Button, List } from 'antd';

const CustomList = ({ data, onDelete }) => {
  return (
    <div className={style.box}>
      <div className={style.listContainer}>
        <List
          size="large"
          bordered
          dataSource={data}
          renderItem={(item) => (
            <List.Item
              style={{ borderColor: 'var(--color-elem-border)' }}
              actions={[
                <Button type="primary" danger onClick={() => onDelete(item.id)}>X</Button>
              ]}
            >
              <div>
                <p>{item.url}</p>
              </div>
            </List.Item>
          )}
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};

export default CustomList;
