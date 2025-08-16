export const generateDemoData = () => {
  const data = [];
  const categories = ['Technology', 'Healthcare', 'Finance', 'Education', 'Retail', 'Manufacturing', 'Transportation', 'Energy'];
  
  for (let i = 0; i < 100; i++) {
    const category = categories[i % categories.length];
    const revenue = Math.floor(Math.random() * 1000000) + 100000;
    const profit = revenue * (0.1 + Math.random() * 0.3);
    const employees = Math.floor(Math.random() * 1000) + 50;
    const growth = (Math.random() - 0.5) * 0.4; // -20% to +20%
    
    data.push({
      id: i + 1,
      category,
      revenue,
      profit: Math.round(profit),
      employees,
      growth: Math.round(growth * 100) / 100,
      year: 2020 + (i % 5),
      quarter: (i % 4) + 1,
      market_cap: revenue * (5 + Math.random() * 10),
      customer_satisfaction: Math.round((0.6 + Math.random() * 0.4) * 100) / 100
    });
  }
  
  return data;
};

export const generateTimeSeriesData = () => {
  const data = [];
  const baseValue = 1000;
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(2024, 0, i + 1);
    const trend = Math.sin(i / 30) * 100; // Seasonal trend
    const noise = (Math.random() - 0.5) * 50; // Random noise
    const value = Math.max(0, baseValue + trend + noise);
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value),
      volume: Math.floor(Math.random() * 1000) + 100,
      price: Math.round((value / 100) * 100) / 100
    });
  }
  
  return data;
};

export const generateCorrelationData = () => {
  const data = [];
  
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 100;
    const correlation = 0.7; // Positive correlation
    const y = x * correlation + (Math.random() - 0.5) * 30;
    
    data.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      size: Math.random() * 20 + 5,
      category: i < 100 ? 'Group A' : 'Group B'
    });
  }
  
  return data;
};
