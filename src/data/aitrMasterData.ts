import { Route, Bus, Driver, Stop } from '../types/transit';

// Acropolis Institute of Technology & Research (AITR) location (Indore Bypass, Mangliya)
export const AITR_COORDINATES = {
  latitude: 22.8210,
  longitude: 75.9435,
  name: 'Acropolis Institute of Technology & Research (AITR)',
  address: 'Indore Bypass Road, Mangliya, Indore, Madhya Pradesh 453771',
};

// Known approximate landmark coordinates in Indore / Dewas / Ujjain area for realistic map display
export const INDORE_LANDMARK_COORDS: Record<string, { lat: number; lng: number }> = {
  'Acropolis Institutes': { lat: 22.8210, lng: 75.9435 },
  'Acropolis College': { lat: 22.8210, lng: 75.9435 },
  'Mhow Naka': { lat: 22.7056, lng: 75.8458 },
  'Mhow Naka (Start)': { lat: 22.7056, lng: 75.8458 },
  'Bhanwarkua Chouraha': { lat: 22.6925, lng: 75.8672 },
  'Bhauwarkua Chouraha': { lat: 22.6925, lng: 75.8672 },
  'Rajendra Nagar Thana': { lat: 22.6710, lng: 75.8290 },
  'Rajiv Gandhi Chouraha': { lat: 22.6845, lng: 75.8640 },
  'Choithram Mandi Chouraha': { lat: 22.6830, lng: 75.8420 },
  'IT Park Chouraha': { lat: 22.6815, lng: 75.8770 },
  'Teen Imli Square': { lat: 22.6912, lng: 75.8942 },
  'Teen Imli': { lat: 22.6912, lng: 75.8942 },
  'Teen Imali Square': { lat: 22.6912, lng: 75.8942 },
  'Musakhedi': { lat: 22.7050, lng: 75.9080 },
  'Mushakhedi Square': { lat: 22.7050, lng: 75.9080 },
  'Musakhedi Chouraha Inside': { lat: 22.7050, lng: 75.9080 },
  'Bengali Chouraha': { lat: 22.7215, lng: 75.9065 },
  'Palasia Chouraha': { lat: 22.7240, lng: 75.8850 },
  'Palasia Thana': { lat: 22.7240, lng: 75.8850 },
  'Vijay Nagar': { lat: 22.7533, lng: 75.8937 },
  'Vijay Nagar Thana': { lat: 22.7533, lng: 75.8937 },
  'Dewas Naka': { lat: 22.7845, lng: 75.9125 },
  'Mangliya Village': { lat: 22.8150, lng: 75.9380 },
  'Khajrana Chouraha': { lat: 22.7350, lng: 75.9010 },
  'Robot Chouraha': { lat: 22.7480, lng: 75.9030 },
  'Navlakha Chouraha': { lat: 22.7020, lng: 75.8750 },
  'Navlakha Bus Stand (Start)': { lat: 22.7020, lng: 75.8750 },
  'Geeta Bhawan Chouraha (Start)': { lat: 22.7160, lng: 75.8830 },
  'LIG Square (Start)': { lat: 22.7380, lng: 75.8850 },
  'Bada Ganpati': { lat: 22.7210, lng: 75.8450 },
  'Rau': { lat: 22.6320, lng: 75.8080 },
  'Silicon City': { lat: 22.6450, lng: 75.8190 },
  'Treasure Fantasy (Rangwasa)': { lat: 22.6520, lng: 75.7950 },
  'Hatod (Start)': { lat: 22.8010, lng: 75.7320 },
  'Gandhi Nagar (Start)': { lat: 22.7520, lng: 75.8010 },
  'Niranjanpur Chouraha (Start)': { lat: 22.7750, lng: 75.8950 },
  'Sun City (Start)': { lat: 22.7680, lng: 75.9180 },
  'Bombay Hospital': { lat: 22.7610, lng: 75.8980 },
  'Radhaganj': { lat: 22.9650, lng: 76.0540 },
  'Maksi (Start)': { lat: 23.2500, lng: 76.1500 },
  'Beema Hospital Agar Road Ujjain (Start)': { lat: 23.1950, lng: 75.7890 },
  'Shipra': { lat: 22.9230, lng: 75.9910 },
  'Kshipra': { lat: 22.9230, lng: 75.9910 },
  'Dakachya': { lat: 22.8680, lng: 75.9680 },
  'Bhopal Chouraha': { lat: 22.9620, lng: 76.0620 },
};

export interface RawRouteGroup {
  group_number: number;
  route_name: string;
  origin: string;
  destination: string;
  buses: Array<{ bus_number: string; driver_name: string; incomplete?: boolean }>;
  stops: string[];
}

export const RAW_ROUTE_GROUPS: RawRouteGroup[] = [
  {
    group_number: 1,
    route_name: 'Treasure Fantasy / CAT Road / Mhow Naka → AITR',
    origin: 'Treasure Fantasy (Rangwasa)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G54', driver_name: 'Rajesh Choudhary' },
      { bus_number: 'G4', driver_name: 'Ram Thakur' },
      { bus_number: 'G5', driver_name: 'Deepak Rathore' },
      { bus_number: 'G76', driver_name: 'Pravin Soni' },
    ],
    stops: [
      'Treasure Fantasy (Rangwasa)', 'Vidur Nagar', 'Hawa Bungla (CAT Road)', 'Sai Dwar', 'Relax Garden',
      'Reti Mandi (Start)', 'Gopur Chouki', 'Jaroliya', 'Dastur Garden', 'Footi Kothi', 'Nurani Nagar (Start)',
      'Chandan Nagar', 'Shankar Kirana', 'Charu Medicoz', 'Ranjeet Hanuman', 'Dravid Nagar', 'Usha Nagar',
      'Mhow Naka', 'Old GDC Jairampur Colony Chouraha', 'Collector Chauraha', 'Palsikar Chauraha',
      'Juni Indore Bridge', 'Sindhi Colony', 'Ashok Nagar Bhauwarkua Main R.', 'Bhauwarkua Chouraha',
      'Navlakha Chouraha', 'Nemawar Road', 'Teen Imli', 'Musakhedi', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 2,
    route_name: 'Chhota Bangarda / Banganga / Palasia → AITR',
    origin: 'Vidhya Palace Chhota Bangarda (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G9', driver_name: 'Onkarlal Choudhary' },
      { bus_number: 'G39', driver_name: 'Sanjay Dwivedi' },
      { bus_number: 'G47', driver_name: 'Kapil Dhepte' },
    ],
    stops: [
      'Vidhya Palace Chhota Bangarda (Start)', 'Yadav Dharmshala', 'Rukmani Nagar', 'Kali Mata Mandir',
      'Rambali Nagar', 'Doodh Dairy', 'Sangam Nagar', 'Khada Ganpati', 'Mahesh Guard Line Petrol Pump',
      'Banganga Stop Old Naka (Start)', 'Marimata Chouraha', 'Agniban Press Chouraha', 'Rajkumar Bridge (Vallabh Nagar)',
      'Malwa Mill', 'Ranisati Gate', 'City Office Chouraha', 'Janjirwala Chouraha', 'Industry House',
      'Palasia Thana', 'Khajrana Chouraha', 'Robot Chouraha', 'Malviya Petrol Pump', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 3,
    route_name: 'RTO Old / Silicon City / IT Park / Tejaji Nagar → AITR',
    origin: 'RTO Old (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G72', driver_name: 'Dhannalal Makwana' },
      { bus_number: 'G17', driver_name: 'Jitendra Giri' },
      { bus_number: 'G1', driver_name: 'Jeevan Thakur' },
      { bus_number: 'G30', driver_name: 'Satish Chouhan' },
    ],
    stops: [
      'RTO Old (Start)', 'Lokmanya Nagar', 'Vinay Nagar', 'Keshar Bag Railway Bridge', 'Silicon City',
      'Shiv City (Start)', 'Silicon City', 'Rajendra Nagar Thana', 'Bijalpur Chouraha', 'Gadbadi Pooliya',
      'Choithram Mandi Chouraha', 'Rajiv Gandhi Chouraha', 'Vishnupuri Chouraha', 'Bhanwarkua Chouraha',
      'Indrapuri', 'IT Park Chouraha', 'SDPS College', 'Khandwa Naka Chouraha', 'Teen Imli Square',
      'Palda Road', 'Limbodi Gate Rani Bagh', 'Kampel (Start)', 'Tejaji Nagar', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 4,
    route_name: 'Indorama / Rau / Bypass → AITR',
    origin: 'Indorama',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G51', driver_name: 'Pravin Yadav' },
      { bus_number: 'G8', driver_name: 'Rohit Solanki' },
      { bus_number: 'G75', driver_name: 'Abhishek Meena' },
      { bus_number: 'G34', driver_name: 'Leeladhar Prajapat' },
    ],
    stops: [
      'Indorama', 'Sagar Kuti', 'Chhatra Chhaya (Main Road)', 'Choupati', 'Chinar/Residency MR',
      'Shanti Nagar', 'Dhar Naka', 'Dreamland (Start)', 'Hotel Shyam Vilas', 'Hari Phatak',
      'Kishanganj Naka', 'Rau', 'Silicon City', 'Tejaji Nagar', 'Silver Spring', 'Devguradiya Bypass',
      'Acropolis Institutes'
    ]
  },
  {
    group_number: 5,
    route_name: 'Mhow Naka / Annapurna / IT Park / Pipliyahana → AITR',
    origin: 'Mhow Naka (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G55', driver_name: 'Santosh Tawar' },
      { bus_number: 'G57', driver_name: 'Jeevan Chavda' },
    ],
    stops: [
      'Mhow Naka (Start)', 'Sachidnand Nagar', 'Dashera Maidan', 'Bank Colony Chouraha', 'Anapurna Mandir',
      'Mishra Nagar', 'Chanankya Puri Chouraha (Start)', 'Vaishali Nagar Chouraha', 'Rajendra Nagar Railway Station',
      'Rajendra Nagar Dutt Mandir', 'Reti Mandi Chouraha', 'Kandhari Julewala A.B. Road', 'Rajendra Nagar Thana',
      'Bijalpur Chouraha', 'Choithram Mandi Chouraha', 'Rajiv Gandhi Chouraha', 'Gurudwara Ring Road',
      'IT Park Chouraha', 'Teen Imali Square', 'Mushakhedi Square', 'Piplya Hana Chouraha', 'JMB',
      'Agrawal Public School', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 6,
    route_name: 'Hatod / Aerodrum / Gangwal / Jawaharmarg → AITR',
    origin: 'Hatod (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G78', driver_name: 'Raju Jadhav' },
      { bus_number: 'G56', driver_name: 'Gajju Limanpure' },
      { bus_number: 'G3', driver_name: 'Jitendra Kelwa' },
    ],
    stops: [
      'Hatod (Start)', 'Gandhi Nagar (Start)', '60 Ft. Road', 'Sukhdev Nagar (Ring Road)', 'Palhar Nagar Ring Road',
      'Aerodrum Thana (Start)', 'Vidhya Dham', 'Kalani Nagar', 'Shikshak Nagar', 'Ramchandra Nagar Petrol Pump',
      'Bada Ganpati', 'Vaishnav Polytechnic College MOG Lines (Start)', 'Gangwal Bus Stand (Square)',
      'Rajmohalla Chouraha Petrol Pump', 'Malganj Chouraha', 'Narsingh Bazar Chouraha', 'Bartan Bazar Chouraha',
      'Gurudwara Jawaharmarg', 'Saifi Hotel', 'District Court MG Road', 'Patel Bridge', 'Patel Pratima',
      'Shrimaya Hotel Madhumilan Chou.', 'Dhakkanwala Kua', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 7,
    route_name: 'Paliya / Aurobindo / MR 10 / Vijay Nagar → AITR',
    origin: 'Paliya Station (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G2', driver_name: 'Lakhan Thakur' },
      { bus_number: 'G21', driver_name: 'Meharban Makwana' },
      { bus_number: 'G35', driver_name: 'Dinesh Makwana' },
      { bus_number: 'G40', driver_name: 'Tej Singh' },
      { bus_number: 'G36', driver_name: 'Pradeep Nagar' },
    ],
    stops: [
      'Paliya Station (Start)', 'Aurbindo Hospital', 'Divya Vihar Colony (Start)', 'Lavkush Chouraha',
      'MR 10 Square', 'Heera Nagar Chouraha', 'Bapat Chouraha', 'Maruti Nagar Chouraha (Start)',
      'ITI Back Side', 'Clerk Colony', 'Gori Nagar', 'ITI Front Side', 'MR-10 Chouraha', 'Heera Nagar Thana',
      'Opposite Fortune Landmark', 'Bhandari Hospital', 'Vijay Nagar Thana', 'Hotel Redisson',
      'Omaxe City & Bypass', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 8,
    route_name: 'Niranjanpur / Scheme 78 / Dewas Naka / Mangliya → AITR',
    origin: 'Niranjanpur Chouraha (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G77', driver_name: 'Rahul Thakur' },
      { bus_number: 'G6', driver_name: 'Rajendra Singh Rathod' },
      { bus_number: 'G74', driver_name: 'Kailash Choudhary' },
      { bus_number: 'G50', driver_name: 'Nilesh Patel' },
    ],
    stops: [
      'Niranjanpur Chouraha (Start)', 'Nakshatra Garden', 'Rajshree Hospital', 'Food Land', 'Sica School',
      'Ashish Nursing Home (Start)', 'Scheme No. 74 Main Road', 'Scheme No. 78 Nai Sadak', 'Dewas Naka',
      'Patel Motors', 'Panchvati', 'Ansal Township / Talawali Chanda', 'Mangliya Village', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 9,
    route_name: 'Sun City / Mahalaxmi Nagar / Bombay Hospital → AITR',
    origin: 'Sun City (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G62', driver_name: 'Ranjeet Patel' },
      { bus_number: 'G63', driver_name: 'Sunil Parmar' },
      { bus_number: 'G61', driver_name: 'Santosh Malviya' },
    ],
    stops: [
      'Sun City (Start)', 'County Park', 'Nariman Point', 'Sai Mandir', 'Mela Ground',
      'Mahalaxmi Nagar Gate', 'Uttam Bhog', 'Bombay Hospital', 'Reliance Fresh', 'Satyasai',
      'Shalimar Palms AB Road', 'Mahindra Showroom', 'Dewas Naka', 'Gulab Baag', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 10,
    route_name: 'Bhamori / Pardeshipura / LIG / Vijay Nagar → AITR',
    origin: 'Bhamori Plaza (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G70', driver_name: 'Lalji Malviya' },
      { bus_number: 'G42', driver_name: 'Chintu Parmar' },
      { bus_number: 'G73', driver_name: 'Nirmal Makwana' },
      { bus_number: 'G46', driver_name: 'Sohan Choudhary' },
    ],
    stops: [
      'Bhamori Plaza (Start)', 'Astha Talkies', 'Bhandari Bridge Thana (Start)', 'Subhash Nagar',
      'Pardeshipura', 'Nanda Nagar Teen Puliya', 'Nanda Nagar', 'Patnipura', 'Atal Dwar',
      'Christian Eminent School', 'LIG Square (Start)', 'Press Complex', 'Malviya Nagar Chouraha',
      'Barfani Dham', 'Rasoma Chouraha', 'Vijay Nagar', 'Hotel Redison Chouraha', 'Omaxe City & Bypass',
      'Acropolis Institutes'
    ]
  },
  {
    group_number: 11,
    route_name: 'Navlakha / Geeta Bhawan / Bengali / Kanadiya → AITR',
    origin: 'Navlakha Bus Stand (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G32', driver_name: 'Mohan Silawat' },
      { bus_number: 'G71', driver_name: 'Jagdish Jatwa' },
      { bus_number: 'G7', driver_name: 'Akhilesh Patel' },
    ],
    stops: [
      'Navlakha Bus Stand (Start)', 'GPO Chouraha Petrol Pump', 'Jaora Compound (BJP Office)', 'M.Y. Chauraha',
      'St. Paul School (Start)', 'Shivaji Vatika', 'Mahatma Gandhi Medical College', 'Geeta Bhawan Chouraha (Start)',
      'Palasia Chouraha (Petrol Pump)', 'Badwani Plaza', 'Patrakar Chouraha', 'Kanadia Road Sabji Mandi',
      'Telephone Chouraha', 'Kanadiya Village (Start)', 'Bengali Chouraha', 'Vaibhav Nagar Chouraha',
      'Sanchar Nagar', 'Manavta Nagar Chouraha', 'Kanadiya Bypass', 'Jhalariya Village', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 12,
    route_name: 'Tilak Nagar / Bengali / Kanadiya Bypass → AITR',
    origin: 'Tilak Nagar Jain Mandir (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G16', driver_name: 'Arjun Choudhary' },
      { bus_number: 'G19', driver_name: 'Anil Choudhary' },
    ],
    stops: [
      'Tilak Nagar Jain Mandir (Start)', 'Telephone Nagar Tempo Stand (Start)', 'Mahavir Nagar',
      'Telephone Chouraha', 'Bengali Chouraha', 'Adarsh Shishu Viahar School', 'Columbia Convent School',
      'Kanadiya Bypass', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 13,
    route_name: 'Jhinsi / Rambag / Regal / Palasia / Khajrana → AITR',
    origin: 'Jhinsi Chouraha (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G41', driver_name: 'Ishtikhar Hussain' },
      { bus_number: 'G38', driver_name: 'Rajesh Nagar' },
      { bus_number: 'G79', driver_name: 'Pancham Lal Patel' },
    ],
    stops: [
      'Jhinsi Chouraha (Start)', 'Neelkanth Colony Chouraha (Badwani Chowki)', 'Imli Bazar', 'Rambag Chouraha',
      'Malhar Ashram', 'Rambag Lokhandepul', 'Nagar Nigam Chouraha', 'Chikmangalur Chouraha (Jail Road)',
      'Rajkumar Bridge', 'Vallabh Nagar (Start)', 'Regal Chouraha', 'Rajani Bhawan M.G. Road', 'Infront of T.I.',
      'Indraprastha Tower', 'Palasia Chouraha Thana', 'Saket Pan Corner', 'Anand Bazar', 'Chandralok Chouraha',
      'Khajrana Chouraha', 'Khajarana Mandir', 'Zum Zum Chouraha', 'Chitragupt Chouraha (Star Chouraha)',
      'Acropolis Institutes'
    ]
  },
  {
    group_number: 14,
    route_name: 'Six Bunglow / Manik Bagh / Sapna Sangeeta / Piplihana → AITR',
    origin: 'Six Bunglow Sitla Mata Mandir (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G69', driver_name: 'Ramchandra Baloniya' },
      { bus_number: 'G33', driver_name: 'Arun Malviya' },
    ],
    stops: [
      'Six Bunglow Sitla Mata Mandir (Start)', 'Reliance Fresh Manik Bagh', 'Palsikar Chouraha (Start)',
      'Manik Bagh Bridge', 'Khatiwala Tank', 'Tower Chouraha', 'Sapna Sangeeta', 'Lotus', 'Agrasen Chouraha',
      'Azad Nagar Chouraha', 'Musakhedi Chouraha Inside', 'Daily College', 'Agriculture College Chouraha',
      'Piplihana Chouraha', 'Hanuman Mandir Ring Road', 'Bengali Chouraha', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 15,
    route_name: 'Bada Nagda / Balgarh / Shipra / Dakachya → AITR',
    origin: 'Bada Nagda (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G31', driver_name: 'Shankar Patel' },
      { bus_number: 'G27', driver_name: 'Govardhan Parmar' },
    ],
    stops: [
      'Bada Nagda (Start)', 'Pal Nagar', 'Bypass', 'Chuna Khadan', 'Anatpura', 'Balgarh', 'Ganesh Puri',
      'Stand Doss Bunglow', 'Mera Bawri', 'Nagda (Start)', 'Pal Nagar', 'Chuna Khadan', 'Balgad',
      'Atal Chourah', 'Ganesh Puri', 'MeeraBawdi', 'Sayaji Dwar', 'Van Mandal', 'Ramnagar', 'Kela Devi',
      'Vikas Nagar', 'Shipra', 'Dakachya', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 16,
    route_name: 'Nagukhedi / Civil Line / Kela Devi / Kshipra → AITR',
    origin: 'Nagukhedi (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G', driver_name: 'Shri Arshad Ali', incomplete: true }, // Incomplete bus number in source
      { bus_number: 'G45', driver_name: 'Shri Azmat Ali' },
      { bus_number: 'G28', driver_name: 'Shri Reetooraj Solanki' },
    ],
    stops: [
      'Nagukhedi (Start)', 'Kamla Nagar', 'Trilok Nagar', 'Itawa', 'Bima Chouraha (Start)', 'Saraswati School',
      'Sawaria Dairy', 'Pioneer School', 'Karmdeep School (Start)', 'Civil Line', 'Sayaji Gate', 'Ujjain Road Bridge',
      'Petrol Pump Chouraha', 'Lal Gate Saiyaji Dwar', 'Van Mandal', 'Ram Nagar', 'Apex Hospital',
      'Kela Devi Jawahar Nagar', 'Hero Honda Showroom', 'Vikas Nagar', 'Bavdiya', 'Amuna', 'Rasalpur',
      'Kshipra', 'Arjun Badoda', 'Dakachya', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 17,
    route_name: 'Datana / Narwar / Etawa / Kshipra → AITR',
    origin: 'Datana (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G28', driver_name: 'Reetooraj Solanki' },
    ],
    stops: [
      'Datana (Start)', 'Semliya Phata', 'Narwar', 'Achnariya', 'Palkhanda', 'Bangar', 'Singawda',
      'Mangawda (Gaushala)', 'Nagukhedi (Bypass)', 'Kamla Nagar', 'Trilok Nagar', 'Etawa', 'Bima Chaurha',
      'Ujjain Road Bridge', 'Pump Chaurha', 'Sayaji Gate', 'Ram Nagar', 'Apex Hospital', 'Kela Devi Jawahar Nagar',
      'Hero Honda Showroom', 'Vikas Nagar', 'Bavdiya', 'Amuna', 'Rasalpur', 'Kshipra', 'Arjun Badoda',
      'Dakachya', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 18,
    route_name: 'Barotha / Bhopal Chouraha / Ujjain Chouraha / Shipra → AITR',
    origin: 'Barotha Village (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G49', driver_name: 'Ramesh Rawat' },
      { bus_number: 'G48', driver_name: 'Dinesh Patel' },
    ],
    stops: [
      'Barotha Village (Start)', 'Siroliya', 'Napakhedi', 'Rajoda', 'Kailod Phata', 'Golden Chouraha Jaitpura',
      'Bhopal Chouraha', 'Radha Ganj', 'Ram Rahim Chauraha', 'Chidawat (Start)', 'Bilawali (Doodh Dairy)',
      'Bamankheda', 'Giriaj Dham', 'Jamuna Nagar', 'Tulja Vihar', 'Awas Nagar Gate', 'BNP Thana',
      'Anaj Mandi', 'Vishram Bagh', 'Bhopal Chouraha', 'Hotel Natraj', 'Bus Stand', 'Ujjain Chouraha',
      'Lal Gate Saiyaji Dwar', 'Van Mandal', 'Ram Nagar', 'Apex Hospital', 'Jawahar Nagar', 'Kela Devi',
      'Vikas Nagar', 'Bavadiya', 'Amuna', 'Rasalpur', 'Lohar Pipliya', 'Shipra', 'Arjun Badoda', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 19,
    route_name: 'Radhaganj / Bhopal Chouraha / Bawdiya / Kshipra → AITR',
    origin: 'Radhaganj',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G44', driver_name: 'Om Prakash Choudhary' },
      { bus_number: 'G37', driver_name: 'Bharat Patel' },
    ],
    stops: [
      'Radhaganj', 'Ram Rahim', 'Mandi', 'Bhopal Chouraha', 'Bus Stand', 'Sayaji Dwar', 'Van Mandal',
      'Ram Nagar', 'Keladevi', 'Vikas Nagar', 'Bawdiya', 'Amuna', 'Rasalpur', 'Kshipra', 'Arjun Baroda',
      'Acropolis Institutes'
    ]
  },
  {
    group_number: 20,
    route_name: 'Maksi / Padliya Jod / Siya / Bilawali → AITR',
    origin: 'Maksi (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G64', driver_name: 'Mukesh Patel' },
      { bus_number: 'G58', driver_name: 'Balkrishna Choudhary' },
      { bus_number: 'G52', driver_name: 'Rajarm Polaya' },
    ],
    stops: [
      'Maksi (Start)', 'Jalapura', 'Badkheda', 'Padliya Jod', 'Chidawad', 'Tok Kala', 'Kalma',
      'Siya', 'Bilawali', 'Baman Kheda', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 21,
    route_name: 'Gandharwpuri / Saver / Pushp Giri / Bhorasa → AITR',
    origin: 'Gandharwpuri',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G68', driver_name: 'Yusuf Patel' },
      { bus_number: 'G67', driver_name: 'Surendra Singh' },
    ],
    stops: [
      'Gandharwpuri', 'Gandharwpuri Fata', 'Mandi Gate', 'Bus Stop', 'Saver', 'Power House',
      'Pushp Giri', 'Navri Fata', 'Bhorasa', 'Bhorasa Fata', 'Jamgod', 'Khatamba', 'D Mart', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 22,
    route_name: 'Ujjain Agar Road / Tower Chouraha / Sanver / Kshipra → AITR',
    origin: 'Beema Hospital Agar Road Ujjain (Start)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G53', driver_name: 'Maksud Khan' },
      { bus_number: 'G15', driver_name: 'Ashok Rathod' },
      { bus_number: 'G66', driver_name: 'Sanjay Makwana' },
      { bus_number: 'G59', driver_name: 'Charan Das' },
    ],
    stops: [
      'Beema Hospital Agar Road Ujjain (Start)', 'Chamunda Mata Mandir (Near Indore Gate)',
      'Ghantaghar (Tower Chouraha)', 'Teen Batti Chouraha', 'Taran Taal', 'Hrishi Nagar', 'Mahananda',
      'Circuit House', 'Naag Jhiri', 'Rukmani Bazaz', 'Malanvasa', 'Triveni (Prashanti Dham)',
      'Sanver Bypass', 'Mangliya Deepo', 'Kshipra', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 23,
    route_name: 'Chapri / Tigariya Chota / Kshipra / Peerkaradia → AITR',
    origin: 'Chapri (Kshipra)',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G25', driver_name: 'Deepak Patel' },
    ],
    stops: [
      'Chapri (Kshipra)', 'Tigariya Chota', 'Sumrakhedi', 'Sukhliya', 'Sunnani Mahakal',
      'Kshipra', 'Kshipra Kheda', 'Peerkaradia', 'Acropolis College', 'Acropolis Institutes'
    ]
  },
  {
    group_number: 24,
    route_name: 'Dakachya / Salotia / Mahudia / Kadwali → AITR',
    origin: 'Dakachya',
    destination: 'Acropolis Institutes',
    buses: [
      { bus_number: 'G43', driver_name: 'Babulal Patel' },
      { bus_number: 'G10', driver_name: 'Chaganlal' },
      { bus_number: 'G26', driver_name: 'Chandar Singh' },
    ],
    stops: [
      'Dakachya', 'Salotia', 'New Salotia', 'Palasiya', 'Mandlawda', 'Mahudia (Start)', 'Nariakhedi',
      'Khelod', 'Tihariu', 'Vyas Khedi', 'Pharaspur', 'Kadwali', 'Bhondwas', 'Sulakhedi', 'Acropolis Institutes'
    ]
  }
];

export function normalizeStopName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[().,/]/g, '')
    .replace(/chouraha|choraha|chauraha|square|point|circle/g, 'chouraha')
    .replace(/bhanwarkua|bhauwarkua|bhawarkua/g, 'bhanwarkua')
    .replace(/musakhedi|mushakhedi/g, 'musakhedi')
    .replace(/bawdiya|bavadiya|bavdiya/g, 'bawdiya')
    .replace(/kanadiya|kanadia/g, 'kanadia')
    .replace(/kshipra|shipra/g, 'kshipra')
    .trim();
}
