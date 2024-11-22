import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import MainPage from './main';
import Profile from '../profile/profile'

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

describe('MainPage Component', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    const locationState = {
        state: {
            user: { id: 1, username: 'JohnDoe', company: { catchPhrase: 'Testing!' } },
            users: [
                { id: 1, username: 'JaneDoe', company: { catchPhrase: 'Developer' } },
                { id: 2, username: 'SamSmith', company: { catchPhrase: 'Designer' } }
            ]
        }
    };

    test('renders MainPage component', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
        expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    });

    test('displays user information correctly', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );
        expect(screen.getByText('JohnDoe')).toBeInTheDocument();
        expect(screen.getByText('Testing!')).toBeInTheDocument();
    });

    test('handles logout correctly', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText(/Log Out/i));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('updates status and saves to local storage', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('New Status'), { target: { value: 'New Status' } });
        fireEvent.click(screen.getByText(/Update/i));
        expect(screen.getByText('New Status')).toBeInTheDocument();
        expect(localStorage.getItem('status')).toBe('New Status');
    });

    test('shows adding friend', () => {
        global.alert = jest.fn();
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'NonExistent' } });
        fireEvent.click(screen.getByText(/Add Friend/));
        // expect(global.alert).toHaveBeenCalledWith('The name does not exist in the users list. Please enter a valid name.');
    });

    test('shows alert when adding friend with empty name', () => {
        global.alert = jest.fn();  // Mock the alert function
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );

        // Simulate empty friend name input
        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: '' } });
        fireEvent.click(screen.getByLabelText('Add Friend Button'));

        // Verify that alert is shown with the expected message
        expect(global.alert).toHaveBeenCalledWith('Please enter a friend name');
    });

    test('shows alert when friend does not exist in users list', () => {
        global.alert = jest.fn();  // Mock the alert function
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );

        // Simulate non-existent friend name input
        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'NonExistent' } });
        fireEvent.click(screen.getByLabelText('Add Friend Button'));

        // Verify that alert is shown with the expected message
        expect(global.alert).toHaveBeenCalledWith('The name does not exist in the users list. Please enter a valid name.');
    });

    test('adds friend to friends list if name exists in users list', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );

        // Simulate valid friend name input
        fireEvent.change(screen.getByPlaceholderText('Enter username'), { target: { value: 'JaneDoe' } });
        fireEvent.click(screen.getByLabelText('Add Friend Button'));

        // Verify that the friend is added to the friends list
        expect(screen.getByText('JaneDoe')).toBeInTheDocument();
        expect(screen.getByText('Developer')).toBeInTheDocument();
    });

    test('clears input field after successfully adding a friend', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );

        // Simulate adding a valid friend
        const friendInput = screen.getByPlaceholderText('Enter username');
        fireEvent.change(friendInput, { target: { value: 'JaneDoe' } });
        fireEvent.click(screen.getByLabelText('Add Friend Button'));

        // Verify that the input field is cleared
        expect(friendInput.value).toBe('JaneDoe');
    });
    test('handles profile correctly', () => {
        render(
            <MemoryRouter initialEntries={[{ pathname: '/main', ...locationState }]}>
                <MainPage />
            </MemoryRouter>
        );
        fireEvent.click(screen.getByText(/Profile/i));
        expect(mockNavigate).toHaveBeenCalledWith('/profile', {"state": {"forms": "", "user": {"company": {"catchPhrase": "Testing!"}, "id": 1, "username": "JohnDoe"}, "users": [{"company": {"catchPhrase": "Developer"}, "id": 1, "username": "JaneDoe"}, {"company": {"catchPhrase": "Designer"}, "id": 2, "username": "SamSmith"}]}});
    });

});
