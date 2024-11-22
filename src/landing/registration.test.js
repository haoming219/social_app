// Register.test.js
import React, {act} from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import {BrowserRouter as Router, MemoryRouter} from 'react-router-dom';
import Register from './registration';

beforeEach(() => {
    global.fetch = jest.fn((url) => {
        if (url.includes('users')) {
            console.log(url)
            return Promise.resolve({
                json: () =>
                    Promise.resolve([
                        {
                            id: 2,
                            name: 'Ervin Howell',
                            username: 'Antonette',
                            email: 'Shanna@melissa.tv',
                            address: {
                                street: 'Victor Plains',
                                suite: 'Suite 879',
                                city: 'Wisokyburgh',
                                zipcode: '90566-7771',
                                geo: {
                                    lat: '-43.9509',
                                    lng: '-34.4618',
                                },
                            },
                            phone: '010-692-6593 x09125',
                            website: 'anastasia.net',
                            company: {
                                name: 'Deckow-Crist',
                                catchPhrase: 'Proactive didactic contingency',
                                bs: 'synergize scalable supply-chains',
                            },
                        },
                    ]),
            });
        }
        // Default fallback for unhandled URLs
        return Promise.resolve({ json: () => [] });
    });
});


describe('Register Component', () => {

    test('renders Register component correctly', () => {
        render(
            <Router>
                <Register />
            </Router>
        );

        // Check if Register form renders
        const registerHeading = screen.getByText(/Welcome to folksZone/i);
        expect(registerHeading).toBeInTheDocument();
    });

    test('allows input change in the Account Name field', () => {
        render(
            <Router>
                <Register />
            </Router>
        );

        const accountNameInput = screen.getByLabelText(/Account Name/i);
        fireEvent.change(accountNameInput, { target: { value: 'TestUser' } });
        expect(accountNameInput.value).toBe('TestUser');
    });

    test('Register with existing user', async () => {
        render(
            <Router>
                <Register />
            </Router>
        );

        fireEvent.change(screen.getByLabelText(/Account Name/i), { target: { value: 'Bret' } });
        // Submit the form
        fireEvent.click(screen.getByLabelText('Register Button'));
        await waitFor(() => {
            expect(screen.getByText('This account name is already in use. Please choose another one.')).toBeInTheDocument();
        });
        // const users = await global.fetch.mock.results[0].value.json();
        // expect(users).toEqual([
        //     { id: 1, username: 'johndoe', email: 'john.doe@example.com' },
        //     { id: 2, username: 'janedoe', email: 'jane.doe@example.com' },
        // ]);
    });

    test('Register with unmatched password', async () => {
        render(
            <Router>
                <Register />
            </Router>
        );

        fireEvent.change(screen.getByTestId(/registerPassword/i), { target: { value: '123' } });
        fireEvent.change(screen.getByTestId(/confirmPassword/i), { target: { value: '1234' } });
        // Submit the form
        fireEvent.click(screen.getByLabelText('Register Button'));
        await waitFor(() => {
            expect(screen.getByText('Passwords do not match!')).toBeInTheDocument();
        });
    });

    test('Login successfully with correct username and password', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Fill out the login form
        fireEvent.change(screen.getByTestId(/loginUsername/i), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByTestId(/loginPassword/i), { target: { value: 'Kulas Light' } });

        // Submit the form
        fireEvent.click(screen.getByLabelText('Login Button'));

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/login successful!/i)).toBeInTheDocument();
        });

    });

    test('Login fails with nonexist username', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Fill out the login form
        fireEvent.change(screen.getByTestId(/loginUsername/i), { target: { value: 'haoming' } });
        fireEvent.change(screen.getByTestId(/loginPassword/i), { target: { value: 'Kulas Light' } });

        // Submit the form
        fireEvent.click(screen.getByLabelText('Login Button'));

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/User not Found! Please enter correct username!/i)).toBeInTheDocument();
        });

    });

    test('Login fails with wrong password', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Fill out the login form
        fireEvent.change(screen.getByTestId(/loginUsername/i), { target: { value: 'Bret' } });
        fireEvent.change(screen.getByTestId(/loginPassword/i), { target: { value: 'wrong password' } });

        // Submit the form
        fireEvent.click(screen.getByLabelText('Login Button'));

        // Wait for success message
        await waitFor(() => {
            expect(screen.getByText(/Incorrect password!/i)).toBeInTheDocument();
        });

    });

    test('Unsuccessful registration', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Fill out the registration form
        fireEvent.change(screen.getByLabelText(/account name/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'newuser@domain.com' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '2000-01-01' } });
        fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '12345' } });
        // fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        // fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByLabelText('Register Button'));

        await waitFor(() => {
            // Check for success message or redirection (you can check the success message here)
            expect(screen.queryByText(<div className="alert alert-success mb-4 text-center" role="alert"
                                           style="font-size: 1.25rem; font-weight: bold;">Register
                successful!</div>)).not.toBeInTheDocument();
        });
    });
    test('Unsuccessful registration for small age', async () => {
        render(
            <MemoryRouter>
                <Register />
            </MemoryRouter>
        );

        // Fill out the registration form
        fireEvent.change(screen.getByLabelText(/account name/i), { target: { value: 'newuser' } });
        fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'newuser@domain.com' } });
        fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: '1234567890' } });
        fireEvent.change(screen.getByLabelText(/date of birth/i), { target: { value: '2010-01-01' } });
        fireEvent.change(screen.getByLabelText(/zip code/i), { target: { value: '12345' } });
        // fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
        // fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'password123' } });

        // Submit the form
        fireEvent.click(screen.getByLabelText('Register Button'));
        expect(screen.getByText('You must be 18 years or older to register.')).toBeInTheDocument();
    });
});
