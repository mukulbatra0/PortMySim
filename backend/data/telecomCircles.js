// List of telecom circles in India
const telecomCircles = [
  {
    id: 'andhra-pradesh',
    name: 'Andhra Pradesh & Telangana',
    code: 'AP',
    regions: ['Andhra Pradesh', 'Telangana'],
    major_cities: ['Hyderabad', 'Vijayawada', 'Visakhapatnam', 'Warangal'],
    operators: ['airtel', 'jio', 'vi', 'bsnl'],
    network_quality: {
      airtel: 4.2,
      jio: 4.5,
      vi: 3.8,
      bsnl: 3.2
    },
    average_data_speed: {
      airtel: 35,
      jio: 40,
      vi: 30,
      bsnl: 15
    },
    population_coverage: {
      airtel: 96,
      jio: 98,
      vi: 90,
      bsnl: 85
    }
  },
  {
    id: 'assam',
    name: 'Assam',
    code: 'AS',
    regions: ['Assam'],
    major_cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
    operators: ['airtel', 'jio', 'vi', 'bsnl'],
    network_quality: {
      airtel: 3.8,
      jio: 4.0,
      vi: 3.5,
      bsnl: 3.4
    },
    average_data_speed: {
      airtel: 25,
      jio: 30,
      vi: 20,
      bsnl: 15
    },
    population_coverage: {
      airtel: 85,
      jio: 90,
      vi: 75,
      bsnl: 80
    }
  },
  {
    id: 'bihar',
    name: 'Bihar & Jharkhand',
    code: 'BR',
    regions: ['Bihar', 'Jharkhand'],
    major_cities: ['Patna', 'Ranchi', 'Jamshedpur', 'Gaya'],
    operators: ['airtel', 'jio', 'vi', 'bsnl'],
    network_quality: {
      airtel: 3.7,
      jio: 4.1,
      vi: 3.4,
      bsnl: 3.0
    },
    average_data_speed: {
      airtel: 25,
      jio: 35,
      vi: 20,
      bsnl: 12
    },
    population_coverage: {
      airtel: 88,
      jio: 93,
      vi: 78,
      bsnl: 85
    }
  },
  {
    id: 'delhi',
    name: 'Delhi NCR',
    code: 'DL',
    regions: ['Delhi', 'Parts of Uttar Pradesh', 'Parts of Haryana'],
    major_cities: ['New Delhi', 'Gurgaon', 'Noida', 'Faridabad'],
    operators: ['airtel', 'jio', 'vi', 'bsnl'],
    network_quality: {
      airtel: 4.7,
      jio: 4.8,
      vi: 4.3,
      bsnl: 3.5
    },
    average_data_speed: {
      airtel: 60,
      jio: 65,
      vi: 45,
      bsnl: 20
    },
    population_coverage: {
      airtel: 99,
      jio: 99,
      vi: 97,
      bsnl: 90
    }
  },
  {
    id: 'gujarat',
    name: 'Gujarat',
    code: 'GJ',
    regions: ['Gujarat', 'Daman and Diu', 'Dadra and Nagar Haveli'],
    major_cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot']
  },
  {
    id: 'haryana',
    name: 'Haryana',
    code: 'HR',
    regions: ['Haryana (except Gurgaon and Faridabad)'],
    major_cities: ['Chandigarh', 'Ambala', 'Panipat', 'Karnal']
  },
  {
    id: 'himachal',
    name: 'Himachal Pradesh',
    code: 'HP',
    regions: ['Himachal Pradesh'],
    major_cities: ['Shimla', 'Dharamshala', 'Mandi', 'Solan']
  },
  {
    id: 'jammu',
    name: 'Jammu & Kashmir',
    code: 'JK',
    regions: ['Jammu & Kashmir', 'Ladakh'],
    major_cities: ['Srinagar', 'Jammu', 'Leh', 'Kargil']
  },
  {
    id: 'karnataka',
    name: 'Karnataka',
    code: 'KA',
    regions: ['Karnataka'],
    major_cities: ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru']
  },
  {
    id: 'kerala',
    name: 'Kerala',
    code: 'KL',
    regions: ['Kerala', 'Lakshadweep'],
    major_cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur']
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    code: 'KO',
    regions: ['Kolkata'],
    major_cities: ['Kolkata'],
    operators: ['airtel', 'jio', 'vi', 'bsnl'],
    network_quality: {
      airtel: 4.4,
      jio: 4.5,
      vi: 4.0,
      bsnl: 3.3
    },
    average_data_speed: {
      airtel: 50,
      jio: 55,
      vi: 38,
      bsnl: 16
    },
    population_coverage: {
      airtel: 97,
      jio: 98,
      vi: 94,
      bsnl: 86
    }
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra & Goa',
    code: 'MH',
    regions: ['Maharashtra (except Mumbai)', 'Goa'],
    major_cities: ['Pune', 'Nagpur', 'Nasik', 'Panaji']
  },
  {
    id: 'madhya-pradesh',
    name: 'Madhya Pradesh & Chhattisgarh',
    code: 'MP',
    regions: ['Madhya Pradesh', 'Chhattisgarh'],
    major_cities: ['Bhopal', 'Indore', 'Raipur', 'Jabalpur']
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    code: 'MU',
    regions: ['Mumbai', 'Navi Mumbai', 'Thane'],
    major_cities: ['Mumbai', 'Navi Mumbai', 'Thane'],
    operators: ['airtel', 'jio', 'vi', 'bsnl'],
    network_quality: {
      airtel: 4.6,
      jio: 4.7,
      vi: 4.2,
      bsnl: 3.4
    },
    average_data_speed: {
      airtel: 55,
      jio: 60,
      vi: 40,
      bsnl: 18
    },
    population_coverage: {
      airtel: 98,
      jio: 99,
      vi: 95,
      bsnl: 88
    }
  },
  {
    id: 'northeast',
    name: 'North East',
    code: 'NE',
    regions: ['Arunachal Pradesh', 'Meghalaya', 'Mizoram', 'Nagaland', 'Manipur', 'Tripura', 'Sikkim'],
    major_cities: ['Shillong', 'Agartala', 'Imphal', 'Aizawl']
  },
  {
    id: 'orissa',
    name: 'Orissa',
    code: 'OR',
    regions: ['Odisha'],
    major_cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Sambalpur']
  },
  {
    id: 'punjab',
    name: 'Punjab',
    code: 'PB',
    regions: ['Punjab', 'Chandigarh'],
    major_cities: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar']
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan',
    code: 'RJ',
    regions: ['Rajasthan'],
    major_cities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota']
  },
  {
    id: 'tamil-nadu',
    name: 'Tamil Nadu',
    code: 'TN',
    regions: ['Tamil Nadu', 'Pondicherry'],
    major_cities: ['Chennai', 'Coimbatore', 'Madurai', 'Pondicherry']
  },
  {
    id: 'up-east',
    name: 'UP East',
    code: 'UE',
    regions: ['Eastern Uttar Pradesh'],
    major_cities: ['Lucknow', 'Varanasi', 'Gorakhpur', 'Allahabad']
  },
  {
    id: 'up-west',
    name: 'UP West',
    code: 'UW',
    regions: ['Western Uttar Pradesh (except areas in NCR)'],
    major_cities: ['Meerut', 'Agra', 'Aligarh', 'Bareilly']
  },
  {
    id: 'west-bengal',
    name: 'West Bengal',
    code: 'WB',
    regions: ['West Bengal (except Kolkata)', 'Andaman and Nicobar Islands'],
    major_cities: ['Howrah', 'Durgapur', 'Siliguri', 'Asansol']
  }
];

module.exports = telecomCircles; 