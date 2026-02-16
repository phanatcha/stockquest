
import axios from 'axios';

const API_URL = 'http://localhost:3000';

async function main() {
    try {
        console.log('--- SHARED: Registering Admin ---');
        let adminToken = '';
        try {
            const adminReg = await axios.post(`${API_URL}/auth/register`, {
                email: 'admin@example.com',
                username: 'adminuser',
                name: 'Admin User',
                password: 'ActionPassword123!',
                role: 'ADMIN' // Only works if backend allows passing role, otherwise manual DB update needed
            });
            console.log('Admin Registered:', adminReg.data);
            adminToken = adminReg.data.access_token;
        } catch (e: any) {
            if (e.response && e.response.status === 409) {
                console.log('Admin already exists, logging in...');
                const adminLogin = await axios.post(`${API_URL}/auth/login`, {
                    usernameOrEmail: 'adminuser',
                    password: 'ActionPassword123!'
                });
                adminToken = adminLogin.data.access_token;
                console.log('Admin Logged In');
            } else {
                throw e;
            }
        }

        console.log('\n--- SHARED: Registering Player ---');
        let playerToken = '';
        try {
            const playerReg = await axios.post(`${API_URL}/auth/register`, {
                email: 'player@example.com',
                username: 'playeruser',
                name: 'Player One',
                password: 'PlayerPassword123!'
            });
            console.log('Player Registered:', playerReg.data);
            playerToken = playerReg.data.access_token;
        } catch (e: any) {
            if (e.response && e.response.status === 409) {
                console.log('Player already exists, logging in...');
                const playerLogin = await axios.post(`${API_URL}/auth/login`, {
                    usernameOrEmail: 'playeruser',
                    password: 'PlayerPassword123!'
                });
                playerToken = playerLogin.data.access_token;
                console.log('Player Logged In');
            } else {
                throw e;
            }
        }

        console.log('\n--- ADMIN: Creating League ---');
        let leagueId = '';
        const leagueData = {
            name: 'Test League ' + Date.now(),
            startingCapital: 100000,
            endDate: new Date(Date.now() + 86400000 * 30).toISOString(), // 30 days from now
            isPublic: true
        };
        const leagueRes = await axios.post(`${API_URL}/leagues`, leagueData, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('League Created:', leagueRes.data);
        leagueId = leagueRes.data.id;

        console.log('\n--- PLAYER: Joining League ---');
        const joinRes = await axios.post(`${API_URL}/leagues/${leagueId}/join`, {}, {
            headers: { Authorization: `Bearer ${playerToken}` }
        });
        console.log('Joined League:', joinRes.data);
        const portfolioId = joinRes.data.id;

        console.log('\n--- PLAYER: Placing BUY Order ---');
        const buyOrder = {
            portfolioId: portfolioId,
            symbol: 'AAPL',
            quantity: 10,
            type: 'BUY',
            price: 150.50
        };
        const orderRes = await axios.post(`${API_URL}/orders`, buyOrder, {
            headers: { Authorization: `Bearer ${playerToken}` }
        });
        console.log('Order Placed:', orderRes.data);

        console.log('\n--- PLAYER: Viewing Portfolio ---');
        const portfolioRes = await axios.get(`${API_URL}/portfolios/${portfolioId}`, {
            headers: { Authorization: `Bearer ${playerToken}` }
        });
        console.log('Portfolio Details:', portfolioRes.data);

    } catch (error: any) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

main();
