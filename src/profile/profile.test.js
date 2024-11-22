import { render, screen, fireEvent } from '@testing-library/react';
import Profile from './profile';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('Profile Component', () => {
    const locationState = {
        state: {
            user: { id: 1, username: 'JohnDoe', company: { catchPhrase: 'Testing!' } },
            users: [
                { id: 1, username: 'JaneDoe', company: { catchPhrase: 'Developer' } },
                { id: 2, username: 'SamSmith', company: { catchPhrase: 'Designer' } }
            ]
        }
    };

    test('renders Profile component and displays initial data', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/profile', ...locationState }]}>
                <Profile />
            </MemoryRouter>
        );

        expect(screen.getByText(/Profile Page/i)).toBeInTheDocument();
        expect(screen.getByText(/User name: JohnDoe/i)).toBeInTheDocument();
        expect(screen.getByText(/Email Address123@rice.edu/i)).toBeInTheDocument();
    });

    test('should handle form field changes', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/profile', ...locationState }]}>
                <Profile />
            </MemoryRouter>
        );

        const usernameInput = screen.getByLabelText('User Name');
        fireEvent.change(usernameInput, { target: { value: 'UpdatedName' } });
        expect(usernameInput.value).toBe('UpdatedName');
    });

    test('should navigate to main page when Main Page button is clicked', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/profile', ...locationState }]}>
                <Profile />
            </MemoryRouter>
        );

        const mainPageButton = screen.getByText(/Main Page/i);
        fireEvent.click(mainPageButton);
        expect(mockNavigate).toHaveBeenCalledWith('/main', { state: { user: locationState.state.user, users: locationState.state.users } });
    });

    test('should show an alert if passwords do not match on form submission', () => {
        window.alert = jest.fn(); // Mock alert
        render(
            <MemoryRouter initialEntries={[{ pathname: '/profile', ...locationState }]}>
                <Profile />
            </MemoryRouter>
        );

        const passwordInput = screen.getByLabelText('Password *');
        const confirmPasswordInput = screen.getByLabelText('Confirm Password *');
        const updateButton = screen.getByText(/Update/i);

        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'differentPassword' } });
        fireEvent.click(updateButton);

        expect(window.alert).toHaveBeenCalledWith('sorry, the password does not match. Pleas try again');
    });
});
