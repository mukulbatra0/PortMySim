// Seed data for porting rules for each telecom circle in India

const portingRules = [
  {
    circle: "delhi",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-01-01"), description: "New Year's Day" },
      { date: new Date("2025-04-10"), description: "Ramnavami" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "Porting within NCR region may take 24-48 hours. Carry a valid photo ID proof when visiting the porting center.",
    active: true
  },
  {
    circle: "mumbai",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-14"), description: "Ambedkar Jayanti" },
      { date: new Date("2025-09-19"), description: "Ganesh Chaturthi" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "For premium number retention, contact your service provider before initiating porting.",
    active: true
  },
  {
    circle: "kolkata",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-10-22"), description: "Durga Puja" },
      { date: new Date("2025-11-12"), description: "Kali Puja" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "maharashtra",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-14"), description: "Ambedkar Jayanti" },
      { date: new Date("2025-05-01"), description: "Maharashtra Day" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "gujarat",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-01-14"), description: "Uttarayan" },
      { date: new Date("2025-10-24"), description: "Diwali" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "andhra-pradesh",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-13"), description: "Ugadi" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "karnataka",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-11-01"), description: "Karnataka Rajyotsava" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "tamil-nadu",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-01-15"), description: "Pongal" },
      { date: new Date("2025-04-14"), description: "Tamil New Year" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "kerala",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-14"), description: "Vishu" },
      { date: new Date("2025-08-30"), description: "Onam" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "punjab",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-13"), description: "Baisakhi" },
      { date: new Date("2025-11-15"), description: "Guru Nanak Jayanti" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "haryana",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "For cities like Bhiwani, check if they fall under Delhi-NCR circle for porting.",
    active: true
  },
  {
    circle: "up-east",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "up-west",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "rajasthan",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-03-28"), description: "Rajasthan Day" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "Madhya Pradesh",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-11-01"), description: "MP Foundation Day" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "West Bengal",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-10-22"), description: "Durga Puja" },
      { date: new Date("2025-05-09"), description: "Rabindra Jayanti" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "Bihar",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-03-22"), description: "Bihar Diwas" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "Odisha",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-01"), description: "Utkal Divas" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "Assam",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-04-14"), description: "Bihu" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "",
    active: true
  },
  {
    circle: "North East",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "In remote areas, porting process may take up to 7 working days.",
    active: true
  },
  {
    circle: "Jammu & Kashmir",
    workingDaysBeforePorting: 5, // Special case: 5 working days for J&K
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-03-23"), description: "Martyrs' Day" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "Due to network conditions, porting in remote areas may take longer. Additional documentation may be required.",
    active: true
  },
  {
    circle: "Himachal Pradesh",
    workingDaysBeforePorting: 3,
    holidayList: [
      { date: new Date("2025-01-26"), description: "Republic Day" },
      { date: new Date("2025-08-15"), description: "Independence Day" },
      { date: new Date("2025-10-02"), description: "Gandhi Jayanti" },
      { date: new Date("2025-01-25"), description: "Himachal Pradesh Statehood Day" }
    ],
    minUsagePeriod: 90,
    duePaymentPeriod: 15,
    portingFee: {
      withinCircle: 6.5,
      outsideCircle: 19
    },
    specialInstructions: "In hilly areas, visit nearest town's service center for porting.",
    active: true
  }
];

export default portingRules; 