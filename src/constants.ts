import { PantryItem, Recipe } from './types';

export const MOCK_ITEMS: PantryItem[] = [
  {
    id: '1',
    name: 'Vollmilch',
    category: 'Kühlschrank',
    quantity: '1.2L',
    expiryDate: '2026-03-28T00:00:00Z',
    status: 'expired',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-R90_48jTOMP44WprOfnryrycAweArahqTiZhKBkSm4j-yHgVxPThbqiE7tEg5BPHAtrXNG_DXt3k-3OGbPwBS0nNjNpJQAYrLP20NmzxDxv0tF29C9KWM7lXtE5nuX-fVxJKiIx8FC1IN12W5FFCCMkSqlrwwv2mpSCYvIlD-_TemSYMLg3H5ZJYzSGboMa5hRD77WhC3vXCRA7nS9RCqt36Q147QZQEVjPbWeGKz47TWV4J2HmZQgYmdX6MnHZKuJeYolZ9NnGX',
    tags: ['Milchprodukte', 'Kühlschrank Fach 2'],
    uid: 'mock-user'
  },
  {
    id: '2',
    name: 'Reife Avocados',
    category: 'Speisekammer',
    quantity: '3',
    expiryDate: '2026-03-31T00:00:00Z',
    status: 'warning',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB61EUPs39j5JkZOytpT5FlaETnq4fY39FT_eDjOJsWWmX8v4KOKvAT5uUJF6T1H-s1RW1Zn70YXrNSP1f_kbpzEhCo2szpNHXRkBeJWzhcILYxoKVzORBQKzvxklUc-5qhtn6SgAwKcrDyHyXWUvLth4mEkxmgWe6p_CitAiMM8v-JRGNBJsSJ9ImzHlrm5xvPaSK40n-gGiH8E8F4tNSKKeokc9HhduuRaPFHDUQx8bNuEkUtSZfb2v_za4NrNUz4N_t3wWRnIe6O',
    tags: ['Gemüse'],
    uid: 'mock-user'
  },
  {
    id: '3',
    name: 'Baby-Karotten',
    category: 'Kühlschrank',
    quantity: '500g',
    expiryDate: '2026-04-05T00:00:00Z',
    status: 'safe',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC2f4SC3XGe4gAJ_n4gFJRkDEG8to_srlz5kIPZZOyD6tOflE8TC9FPB2clQd5E3fstYieTD1XduuSkq38QQZxbPnmFoMZuSdg0rVJh0M01hNHoGpqsf0wAfCtkGmxzKUcPG7jUOHtdcA5297Io83jnBsp5NjghcUO8CHn3qqjhD2iLQrvluE1Xpgm1ewx-WC10rMa0JwWatFIXGfJsXgenDmN1aOOzbiqFEoC84ZWVcUX-KWV4dQsrUvX2o7rCQCz3Y0gsHDR_Q2Aq',
    tags: ['Gemüse'],
    uid: 'mock-user'
  },
  {
    id: '4',
    name: 'Gartenerbsen',
    category: 'Gefrierfach',
    quantity: '2kg',
    expiryDate: '2026-05-15T00:00:00Z',
    status: 'fresh',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3QFx-1xBsjLAY7Rbzt2ffNSgmn-bQcuyKZEqTjZZw7pTg2nqJqd-UD7lXxHNhtAG88WWl-9RfQxf4oI8kJdUAXVvQoIGvss6qJCz-QwbnR-sTIt0YYRKM97M-lWTOdjKahRfpgeACsRlIiKnkMqpy3fvv1DyjEOFF_k0QGPNWE-YoGZBLdHS6cuH6P5AScyATyjHCZ1c777ZAqrCbow6r3lEiZvnK8LB-JnIPzSkkD3q4Rz1bpTabBbDPJd9e6Q6_bpgCwhGciQFP',
    tags: ['Gemüse'],
    uid: 'mock-user'
  }
];

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Ernte-Buddha-Bowl',
    description: 'Köstliche Ideen aus deinen Vorräten, die heute verbraucht werden sollten.',
    ingredients: ['Grünkohl', 'Süßkartoffel', 'Griechischer Joghurt', 'Quinoa'],
    savedItems: ['Grünkohl', 'Süßkartoffel', 'Griechischer Joghurt'],
    time: '25 Min.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDX5khoD1kQLedyyIUmmpCzvz2jXLslMCxc5_zTRGL_qV1GFYDn7LNfpRh7kRKQauNkoxFZADgb1FGdsXbORnd0MwN7bcjeKDZDsSjxj8XjdQG7DMObhWre6VO5uNUQa963WoapmaFDQXNA3FKm8zrfndlnrvcjxpwYQevl99I-ngCIfh8QOaZ7QHhkjDC9-Zb0LRFflQUg_03Wq3JWVlAqA7kZNQtZQENIhAju5imyzms_8h7QV-l5RIuCjrRgJKWmi0YeFO4KCpCc'
  },
  {
    id: 'r2',
    title: '15-Min Vorrats-Pasta',
    description: 'Schnell & Einfach',
    ingredients: ['Spinat', 'Schlagsahne'],
    savedItems: ['Spinat', 'Schlagsahne'],
    time: '15 Min.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUjMtUKsOTERnRkCEyiE85IfZ6VZyONhBnIPj4R9RdyaKpL8bow8-RrLyhZzlGghiL-C-RDLutO3J88z37Ta3UcPGn8U3DotDCYBSf2oLqoSxObr7PDwjMt4WxXYB93aQJW0QRzRHz-UoZhFgqTkpQrU5PT3hnO6MSqad9q4NTVHqy6e1_h3-jth6WIPOI_l6c8nSd-ctLR2KT-k0E9YWnuJ5eEZ0xcqUFJW-C1dHp_2A1KmWfFOUfZU-hSMWKScf1YxtKqeKIIRjv'
  },
  {
    id: 'r3',
    title: 'Cremiger Beeren-Smoothie',
    description: 'Frühstück',
    ingredients: ['Vollmilch', 'Erdbeeren'],
    savedItems: ['Vollmilch', 'Erdbeeren'],
    time: '5 Min.',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwN_vCPeJd32WtvVVCu1PX4uDMa4pzuic2DZ-S-M2HCU6ucnLJqThTqnA5GVJTxj6IVdhl0BySDWj3_gTxkkHm66FLC8LBj_l9Uf1gur1ew4XJlKm9-ViZvHKJEdZU3GiGqALyp5jnMO_yM5KBaDvZVhfjBz7L7ajdT2rOZfWgkZFI6cmxedv5dV4JYdps1shcuakfHAqJTBvR5p9uMY--oTCJBo4g1EwnAiFOgVLv_I0q_G9fcOFWeckjOAhRXRK45L1priVJb-0H'
  }
];
