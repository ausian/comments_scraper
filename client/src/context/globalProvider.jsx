import React, { useState, useEffect, useCallback } from 'react';
import GlobalContext from './globalContext';
import axios from 'axios';

const GlobalProvider = ({ children }) => {
  const [sources, setSources] = useState([]);
  const [dataWebUrls, setDataWebUrls] = useState([]);
  const [data, setData] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL;

  const fetchSources = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/sources`);
      setSources(response.data);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  }, []);

  const fetchWebUrls = useCallback(async (sourceId) => {
    try {
      const response = await axios.get(`${apiUrl}/weburls?sourceId=${sourceId}`);
      setDataWebUrls(response.data);
    } catch (error) {
      console.error('Error fetching Web URLs:', error);
    }
  }, []);

  const createWebUrl = useCallback(async (newWebUrl) => {
    try {
      const response = await axios.post(`${apiUrl}/weburls`, newWebUrl);
      setDataWebUrls((prevWebUrls) => [...prevWebUrls, response.data]);
    } catch (error) {
      console.error('Error creating Web URL:', error);
    }
  }, []);

  const deleteWebUrl = useCallback(async (id) => {
    try {
      await axios.delete(`${apiUrl}/weburls/${id}`);
      setDataWebUrls((prevWebUrls) => prevWebUrls.filter(webUrl => webUrl.id !== id));
    } catch (error) {
      console.error('Error deleting Web URL:', error);
    }
  }, []);

  const fetchData = useCallback(async (sourceId) => {
    try {
      const response = await axios.get(`${apiUrl}/data?sourceId=${sourceId}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  const createData = useCallback(async (newData) => {
    try {
      const response = await axios.post(`${apiUrl}/data`, newData);
      setData((prevData) => [...prevData, response.data]);
    } catch (error) {
      console.error('Error creating data:', error);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  return (
    <GlobalContext.Provider value={{
      sources,
      dataWebUrls,
      data,
      fetchSources,
      fetchWebUrls,
      createWebUrl,
      deleteWebUrl,
      fetchData,
      createData
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
