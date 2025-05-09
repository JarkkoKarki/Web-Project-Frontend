import {useCallback, useEffect, useState} from 'react';
import {fetchData} from '../../utils/fetchData';
import {url} from '../../utils/variables';
import {useLanguageContext} from '../../contexts/LanguageContext.jsx';

const useAuthentication = () => {
  const postLogin = async (inputs) => {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    };
    const loginResult = await fetchData(url + '/auth/login', fetchOptions);

    window.localStorage.setItem('token', loginResult.token);

    return loginResult;
  };

  return {postLogin};
};

const useUser = () => {
  const postUser = async (inputs) => {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inputs),
    };
    return await fetchData(url + '/users', fetchOptions);
  };

  const getUserByToken = useCallback(async (token) => {
    const fetchOptions = {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
        'Content-Type': 'application/json',
      },
    };

    const userResult = await fetchData(url + '/auth/me', fetchOptions);

    return userResult;
  }, []);

  const deleteUser = useCallback(async (userId) => {
    const fetchOptions = {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
    };

    return await fetchData(url + '/users/' + userId, fetchOptions);
  }, []);

  return {getUserByToken, postUser, deleteUser};
};

const useUpdateUser = () => {
  const putUser = useCallback(async (inputs) => {
    if (!inputs || !inputs.id) {
      throw new Error('Invalid inputs: ID is required');
    }

    const fetchOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      body: JSON.stringify(inputs),
    };

    return await fetchData(url + '/users/' + inputs.id, fetchOptions);
  }, []);

  const updateProfilePicture = useCallback(async (file, id, user) => {
    if (!file || !user) {
      throw new Error('Invalid inputs: file and user are required');
    }

    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('id', id);
    formData.append('user', JSON.stringify(user));

    const fetchOptions = {
      method: 'PUT',
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
      mode: 'cors',
      body: formData,
    };

    return await fetchData(url + '/users/' + id, fetchOptions);
  }, []);

  return {putUser, updateProfilePicture};
};

const useOrders = () => {
  const {language} = useLanguageContext();

  const getOrdersByUserId = useCallback(async () => {
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
    };

    return await fetchData(url + '/orders/myorders/' + language, fetchOptions);
  }, [language]);

  const getAllOrders = useCallback(async () => {
    const fetchOptions = {
      headers: {
        Authorization: 'Bearer ' + window.localStorage.getItem('token'),
      },
    };

    return await fetchData(url + '/orders/' + language, fetchOptions);
  }, [language]);

  return {getOrdersByUserId, getAllOrders};
};
export const updateOrderStatus = async (orderId, newStatus, token) => {
  try {
    const response = await fetch(url + `/orders/${orderId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({status: newStatus}),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order status');
    }

    return data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

const useReservations = () => {
  const [reservations, setReservations] = useState([]);
  const getReservations = async () => {
    try {
      const data = await fetchData(url + '/reservations/');

      const reservations = data.map((item) => {
        return {
          ...item,
          reservation_date: new Date(item.reservation_date).toLocaleDateString(
            'fi-FI',
          ),
        };
      });

      setReservations(reservations);
    } catch (error) {
      console.error('Error getting reservations:', error);
      throw error;
    }
  };

  useEffect(() => {
    getReservations();
  }, []);

  return {reservations};
};

export {useAuthentication, useUser, useUpdateUser, useOrders, useReservations};
