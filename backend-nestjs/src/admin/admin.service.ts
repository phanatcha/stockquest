import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getDashboardData() {
    return {
      dailyActivity: [
        { time: '6:00 am', users: 200 },
        { time: '7:00 am', users: 300 },
        { time: '8:00 am', users: 550 },
        { time: '9:00 am', users: 720 },
        { time: '10:00 am', users: 1000 },
        { time: '11:00 am', users: 1100 },
        { time: '12:00 pm', users: 800 },
        { time: '13:00 pm', users: 880 },
        { time: '14:00 pm', users: 1200 },
        { time: '15:00 pm', users: 1400 },
        { time: '16:00 pm', users: 1300 },
        { time: '17:00 pm', users: 1250 },
        { time: '18:00 pm', users: 650 },
        { time: '19:00 pm', users: 400 },
      ],
      suspiciousUsers: [
        {
          id: '1',
          username: 'PATTER301',
          reason: 'Pump and Dump',
          date: '18/3/2026',
          time: '10:30',
          uid: 'cb8fa052-f3e4-41e8-a23b-6e5e88e72f44',
          color: 'bg-red-900 border-red-700',
        },
        {
          id: '2',
          username: 'BTPUNCHY',
          reason: 'Rapid Order Cancellations',
          date: '18/3/2026',
          time: '12:45',
          uid: 'f4e0c2a1-0bbc-48a5-b27c-d0f5e0da2b4c',
          color: 'bg-orange-800 border-orange-600',
        },
        {
          id: '3',
          username: 'ASAPROCKY',
          reason: 'Unverified Identity',
          date: '18/3/2026',
          time: '15:00',
          uid: 'b2f2c0b4-5b32-41f2-98ea-8b4311059f1a',
          color: 'bg-amber-800 border-amber-600',
        },
      ],
      aiSentiment: [
        {
          id: '1',
          title: 'US Tariff drags down export',
          text: "US tariff escalations are dragging down export expectations. AI identifies a shift toward 'Geo-economic Fragmentation'",
          date: '18/3/2026',
          time: '17:38 pm',
        },
        {
          id: '2',
          title: 'Middle East Tensions',
          text: 'Middle East tensions (US-Iran conflict) are causing high volatility. Crude oil sentiment is spiking, impacting energy costs',
          date: '17/3/2026',
          time: '13:14 pm',
        },
        {
          id: '3',
          title: "Thai Electronics 'Safe Haven'",
          text: "Foreign capital is rotating into Thai electronics as a 'Safe Haven' for the AI infrastructure theme. Weakening Baht provides an additional export margin buffer",
          date: '16/3/2026',
          time: '15:50 pm',
        },
      ],
    };
  }
}
