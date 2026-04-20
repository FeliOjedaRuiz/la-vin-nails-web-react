import React, { createContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePushNotifications from '../hooks/usePushNotifications';

const AuthContext = createContext();

const restoreUserFromLocalStorage = () => {
	try {
		const user = localStorage.getItem('current-user');
		if (user) {
			return JSON.parse(user);
		}
	} catch (e) {
		console.warn("localStorage not accessible", e);
	}
	return undefined;
};

const restoreDateFromLocalStorage = () => {
	try {
		const date = localStorage.getItem('current-date');
		if (date) {
			return JSON.parse(date);
		}
	} catch (e) {
		console.warn("localStorage not accessible", e);
	}
	return undefined;
};

const restoreWeekFromLocalStorage = () => {
	try {
		const week = localStorage.getItem('current-week');
		if (week) {
			const parsed = JSON.parse(week);
			// Las fechas se serializan como string en JSON; hay que reconstruir los Date
			return {
				firstDay: new Date(parsed.firstDay),
				lastDay: new Date(parsed.lastDay),
			};
		}
	} catch (e) {
		console.warn("localStorage not accessible", e);
	}
	return undefined;
};

function AuthStore({ children }) {
	const [user, setUser] = useState(restoreUserFromLocalStorage());
	const [currentWeek, setCurrentWeek] = useState(undefined);
	const [currentDate, setCurrentDate] = useState(undefined);
	const navigate = useNavigate();

	usePushNotifications(user);

	const handleUserChange = useCallback((user) => {
		console.log('Updating user context', user);
		if (!user) {
			try {
				localStorage.removeItem('user-access-token');
				localStorage.removeItem('current-user');
				localStorage.removeItem('current-week');
				localStorage.removeItem('current-date');
			} catch (e) {
				console.warn("localStorage not accessible", e);
			}
		} else {
			try {
				localStorage.setItem('user-access-token', user.token);
				localStorage.setItem('current-user', JSON.stringify(user));
			} catch (e) {
				console.warn("localStorage not accessible", e);
			}
		}
		setUser(user);
	}, []);

	const logout = useCallback(() => {
		handleUserChange();
		navigate('/login');
	}, [handleUserChange, navigate]);

	const deleteDate = useCallback(() => {
		setCurrentDate();
	}, []);

	const handleWeekSelect = useCallback((week) => {
		console.log('Updating week context', week);
		if (!week) {
			try {
				localStorage.removeItem('current-week');
			} catch (e) {}
		} else {
			try {
				localStorage.setItem('current-week', JSON.stringify(week));
			} catch (e) {}
		}
		setCurrentWeek(week);
	}, []);

	const handleDateSelect = useCallback((date) => {
		console.log('Updating date context', date);
		if (!date) {
			try {
				localStorage.removeItem('current-date');
			} catch (e) {}
		} else {
			try {
				localStorage.setItem('current-date', JSON.stringify(date));
			} catch (e) {}
		}
		setCurrentDate(date);
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				currentWeek,
        currentDate,
				deleteDate,
				onUserChange: handleUserChange,
				logout,
				onWeekSelect: handleWeekSelect,
        onDateSelect: handleDateSelect,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export { AuthStore as default, AuthContext };
