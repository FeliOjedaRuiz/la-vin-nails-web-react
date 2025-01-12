import React, { createContext, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

const restoreUserFromLocalStorage = () => {
	const user = localStorage.getItem('current-user');
	if (user) {
		return JSON.parse(user);
	} else {
		return undefined;
	}
};

const restoreDateFromLocalStorage = () => {
	const date = localStorage.getItem('current-date');
	if (date) {
		return JSON.parse(date);
	} else {
		return undefined;
	}
};

function AuthStore({ children }) {
	const [user, setUser] = useState(restoreUserFromLocalStorage());
	const [currentWeek, setCurrentWeek] = useState();
	const [currentDate, setCurrentDate] = useState(restoreDateFromLocalStorage());
	const navigate = useNavigate();

	const handleUserChange = useCallback((user) => {
		console.log('Updating user context', user);
		if (!user) {
			localStorage.removeItem('user-access-token');
			localStorage.removeItem('current-user');
			localStorage.removeItem('current-week');
			localStorage.removeItem('current-date');
		} else {
			localStorage.setItem('user-access-token', user.token);
			localStorage.setItem('current-user', JSON.stringify(user));
		}
		setUser(user);
	}, []);

	const logout = useCallback(() => {
		handleUserChange();
		navigate('/login');
	}, []);

	const deleteDate = useCallback(() => {
		setCurrentDate();
	}, []);

	const handleWeekSelect = (week) => {
		console.log('Updating week context', week);
		if (!week) {
			localStorage.removeItem('current-week');
		} else {
			localStorage.setItem('current-week', JSON.stringify(week));
		}
		setCurrentWeek(week);
	};

	const handleDateSelect = (date) => {
		console.log('Updating date context', date);
    if (!date) {
      localStorage.removeItem('current-date');
    } else {
      localStorage.setItem('current-date', JSON.stringify(date));
    }
    setCurrentDate(date);
	};

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
