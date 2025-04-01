// Sample FAQs for the application
const faqs = [
  {
    question: 'What is mobile number portability?',
    answer: 'Mobile Number Portability (MNP) is a service that allows you to switch your mobile service provider while keeping your existing phone number. This means you can change from one network to another without having to inform all your contacts about a new number.',
    category: 'general',
    order: 1,
    isActive: true
  },
  {
    question: 'How long does the porting process take?',
    answer: 'The porting process typically takes 2-7 working days from the time you submit your porting request. However, the exact time can vary based on your current service provider, the new provider, and your telecom circle.',
    category: 'porting',
    order: 1,
    isActive: true
  },
  {
    question: 'Is there any charge for porting my number?',
    answer: 'Yes, there is a nominal porting fee of ₹19 which is charged by the Department of Telecommunications (DoT). This fee is collected by your new service provider when you submit your porting request.',
    category: 'billing',
    order: 1,
    isActive: true
  },
  {
    question: 'Can I port my number if I have outstanding dues with my current operator?',
    answer: 'You should clear all outstanding dues with your current operator before initiating the porting process. Unpaid bills may result in your porting request being rejected by your current operator.',
    category: 'porting',
    order: 2,
    isActive: true
  },
  {
    question: 'What is a UPC code and how do I get it?',
    answer: 'UPC (Unique Porting Code) is a unique code required to port your mobile number. To get the UPC, send an SMS with the text "PORT" followed by a space and your 10-digit mobile number to 1900. For example: "PORT 9876543210". You will receive your UPC via SMS within a few minutes.',
    category: 'porting',
    order: 3,
    isActive: true
  },
  {
    question: 'How long is the UPC code valid?',
    answer: 'The UPC code is valid for 4 days from the date of generation. You must submit your porting request with the UPC code within this period, or you will need to generate a new code.',
    category: 'porting',
    order: 4,
    isActive: true
  },
  {
    question: 'Will my service be interrupted during the porting process?',
    answer: 'There might be a brief service interruption (usually less than 2 hours) during the actual porting process, which typically happens between midnight and 5 AM. During this time, you may not be able to make or receive calls or use data services.',
    category: 'technical',
    order: 1,
    isActive: true
  },
  {
    question: 'Can I port my number if I\'m using a corporate connection?',
    answer: 'Yes, corporate numbers can be ported, but you will need additional documentation such as an authorization letter from your company and proof that you are authorized to request the port.',
    category: 'porting',
    order: 5,
    isActive: true
  },
  {
    question: 'Do I need to buy a new SIM card when porting?',
    answer: 'Yes, you will need to purchase a new SIM card from the operator you want to switch to. This new SIM will be activated with your existing number once the porting process is complete.',
    category: 'porting',
    order: 6,
    isActive: true
  },
  {
    question: 'What happens to my current plans and offers when I port?',
    answer: 'All existing plans, offers, and services with your current operator will be terminated once your number is ported to the new operator. You will need to choose a new plan with your new service provider.',
    category: 'plans',
    order: 1,
    isActive: true
  },
  {
    question: 'Can I port my number multiple times?',
    answer: 'Yes, you can port your number multiple times. However, there is a restriction that you cannot port again within 90 days of your last successful port. This is known as the "90-day lock-in period."',
    category: 'porting',
    order: 7,
    isActive: true
  },
  {
    question: 'What documents do I need to port my number?',
    answer: 'You will need to provide a valid photo ID proof (such as Aadhaar, passport, driving license, or voter ID), address proof, and a recent bill or recharge proof for your current connection. Additionally, you will need the UPC code from your current operator.',
    category: 'porting',
    order: 8,
    isActive: true
  },
  {
    question: 'Can postpaid connections be ported to prepaid and vice versa?',
    answer: 'Yes, you can port from a postpaid connection to a prepaid one and vice versa. The porting process remains the same, but you will need to choose an appropriate plan with your new operator.',
    category: 'porting',
    order: 9,
    isActive: true
  },
  {
    question: 'Will I lose my contacts and data when I port my number?',
    answer: 'No, porting your number only changes your service provider. It does not affect your phone\'s data, contacts, or any other information stored on your device or SIM card. However, it\'s always a good practice to back up your important data before making any changes.',
    category: 'technical',
    order: 2,
    isActive: true
  },
  {
    question: 'How do I track the status of my porting request?',
    answer: 'You can track the status of your porting request through the PortMySim dashboard after logging into your account. Alternatively, you can contact customer support for updates on your porting status.',
    category: 'porting',
    order: 10,
    isActive: true
  }
];

module.exports = faqs; 