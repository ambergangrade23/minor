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
  // Acropolis Campuses
  'Acropolis Institutes': { lat: 22.8210, lng: 75.9435 },
  'Acropolis College': { lat: 22.8210, lng: 75.9435 },

  // Group 22: Ujjain Agar Road / Tower Chouraha / Sanver / Kshipra -> AITR (Bus G15, G53, G66, G59)
  'Beema Hospital Agar Road Ujjain (Start)': { lat: 23.2045, lng: 75.7942 },
  'Chamunda Mata Mandir (Near Indore Gate)': { lat: 23.1812, lng: 75.7825 },
  'Ghantaghar (Tower Chouraha)': { lat: 23.1748, lng: 75.7885 },
  'Teen Batti Chouraha': { lat: 23.1672, lng: 75.7925 },
  'Taran Taal': { lat: 23.1610, lng: 75.7960 },
  'Hrishi Nagar': { lat: 23.1535, lng: 75.8010 },
  'Mahananda': { lat: 23.1460, lng: 75.8075 },
  'Circuit House': { lat: 23.1410, lng: 75.8115 },
  'Naag Jhiri': { lat: 23.1320, lng: 75.8240 },
  'Rukmani Bazaz': { lat: 23.1250, lng: 75.8320 },
  'Malanvasa': { lat: 23.1080, lng: 75.8450 },
  'Triveni (Prashanti Dham)': { lat: 23.0850, lng: 75.8620 },
  'Sanver Bypass': { lat: 22.9780, lng: 75.8280 },
  'Mangliya Deepo': { lat: 22.8290, lng: 75.9280 },
  'Kshipra': { lat: 22.9230, lng: 75.9910 },

  // Group 20: Maksi / Padliya Jod / Siya / Bilawali -> AITR (Bus G64, G58, G52)
  'Maksi (Start)': { lat: 23.2500, lng: 76.1500 },
  'Jalapura': { lat: 23.2100, lng: 76.1300 },
  'Badkheda': { lat: 23.1600, lng: 76.1100 },
  'Padliya Jod': { lat: 23.1100, lng: 76.0900 },
  'Chidawad': { lat: 23.0600, lng: 76.0800 },
  'Tok Kala': { lat: 23.0200, lng: 76.0700 },
  'Kalma': { lat: 22.9900, lng: 76.0600 },
  'Siya': { lat: 22.9700, lng: 76.0500 },
  'Bilawali': { lat: 22.9500, lng: 76.0300 },
  'Baman Kheda': { lat: 22.8800, lng: 75.9800 },

  // Group 21: Gandharwpuri / Saver / Pushp Giri / Bhorasa -> AITR (Bus G68, G67)
  'Gandharwpuri': { lat: 23.0800, lng: 76.2200 },
  'Gandharwpuri Fata': { lat: 23.0650, lng: 76.1950 },
  'Mandi Gate': { lat: 23.0450, lng: 76.1700 },
  'Bus Stop': { lat: 23.0250, lng: 76.1450 },
  'Saver': { lat: 23.0050, lng: 76.1200 },
  'Power House': { lat: 22.9850, lng: 76.0950 },
  'Pushp Giri': { lat: 22.9650, lng: 76.0700 },
  'Navri Fata': { lat: 22.9450, lng: 76.0450 },
  'Bhorasa': { lat: 22.9250, lng: 76.0200 },
  'Bhorasa Fata': { lat: 22.9050, lng: 76.0000 },
  'Jamgod': { lat: 22.8850, lng: 75.9800 },
  'Khatamba': { lat: 22.8650, lng: 75.9650 },
  'D Mart': { lat: 22.8450, lng: 75.9520 },

  // Group 19: Radhaganj / Bhopal Chouraha / Bawdiya / Kshipra -> AITR (Bus G44, G37)
  'Radhaganj': { lat: 22.9650, lng: 76.0540 },
  'Ram Rahim': { lat: 22.9630, lng: 76.0580 },
  'Mandi': { lat: 22.9610, lng: 76.0600 },
  'Bhopal Chouraha': { lat: 22.9620, lng: 76.0620 },
  'Bus Stand': { lat: 22.9600, lng: 76.0550 },
  'Sayaji Dwar': { lat: 22.9550, lng: 76.0480 },
  'Van Mandal': { lat: 22.9500, lng: 76.0400 },
  'Ram Nagar': { lat: 22.9450, lng: 76.0350 },
  'Keladevi': { lat: 22.9400, lng: 76.0300 },
  'Vikas Nagar': { lat: 22.9350, lng: 76.0200 },
  'Bawdiya': { lat: 22.9300, lng: 76.0100 },
  'Amuna': { lat: 22.9260, lng: 76.0020 },
  'Rasalpur': { lat: 22.9200, lng: 75.9950 },
  'Arjun Baroda': { lat: 22.8750, lng: 75.9700 },

  // Group 23: Chapri / Tigariya Chota / Kshipra / Peerkaradia -> AITR (Bus G25)
  'Chapri (Kshipra)': { lat: 22.9350, lng: 75.9850 },
  'Tigariya Chota': { lat: 22.9150, lng: 75.9750 },
  'Sumrakhedi': { lat: 22.8950, lng: 75.9650 },
  'Sukhliya': { lat: 22.8750, lng: 75.9550 },
  'Sunnani Mahakal': { lat: 22.8550, lng: 75.9480 },
  'Kshipra Kheda': { lat: 22.9100, lng: 75.9800 },
  'Peerkaradia': { lat: 22.8500, lng: 75.9450 },

  // Group 24: Dakachya / Salotia / Mahudia / Kadwali -> AITR (Bus G43, G10, G26)
  'Dakachya': { lat: 22.8680, lng: 75.9680 },
  'Salotia': { lat: 22.8620, lng: 75.9600 },
  'New Salotia': { lat: 22.8580, lng: 75.9560 },
  'Palasiya': { lat: 22.8540, lng: 75.9520 },
  'Mandlawda': { lat: 22.8500, lng: 75.9490 },
  'Mahudia (Start)': { lat: 22.8460, lng: 75.9460 },
  'Nariakhedi': { lat: 22.8420, lng: 75.9440 },
  'Khelod': { lat: 22.8380, lng: 75.9420 },
  'Tihariu': { lat: 22.8340, lng: 75.9410 },
  'Vyas Khedi': { lat: 22.8300, lng: 75.9420 },
  'Pharaspur': { lat: 22.8270, lng: 75.9430 },
  'Kadwali': { lat: 22.8240, lng: 75.9432 },
  'Bhondwas': { lat: 22.8220, lng: 75.9433 },
  'Sulakhedi': { lat: 22.8215, lng: 75.9434 },

  // Group 1: Treasure Fantasy / CAT Road / Mhow Naka
  'Treasure Fantasy (Rangwasa)': { lat: 22.6520, lng: 75.7950 },
  'Vidur Nagar': { lat: 22.6610, lng: 75.8050 },
  'Hawa Bungla (CAT Road)': { lat: 22.6720, lng: 75.8180 },
  'Sai Dwar': { lat: 22.6780, lng: 75.8230 },
  'Relax Garden': { lat: 22.6820, lng: 75.8270 },
  'Reti Mandi (Start)': { lat: 22.6750, lng: 75.8310 },
  'Reti Mandi Chouraha': { lat: 22.6750, lng: 75.8310 },
  'Gopur Chouki': { lat: 22.6860, lng: 75.8320 },
  'Jaroliya': { lat: 22.6900, lng: 75.8340 },
  'Dastur Garden': { lat: 22.6930, lng: 75.8370 },
  'Footi Kothi': { lat: 22.6980, lng: 75.8360 },
  'Nurani Nagar (Start)': { lat: 22.7020, lng: 75.8350 },
  'Chandan Nagar': { lat: 22.7060, lng: 75.8330 },
  'Shankar Kirana': { lat: 22.7080, lng: 75.8360 },
  'Charu Medicoz': { lat: 22.7100, lng: 75.8390 },
  'Ranjeet Hanuman': { lat: 22.7120, lng: 75.8410 },
  'Dravid Nagar': { lat: 22.7090, lng: 75.8430 },
  'Usha Nagar': { lat: 22.7070, lng: 75.8440 },
  'Mhow Naka': { lat: 22.7056, lng: 75.8458 },
  'Mhow Naka (Start)': { lat: 22.7056, lng: 75.8458 },
  'Old GDC Jairampur Colony Chouraha': { lat: 22.7040, lng: 75.8510 },
  'Collector Chauraha': { lat: 22.7030, lng: 75.8560 },
  'Palsikar Chauraha': { lat: 22.7010, lng: 75.8600 },
  'Palsikar Chouraha (Start)': { lat: 22.7010, lng: 75.8600 },
  'Juni Indore Bridge': { lat: 22.6990, lng: 75.8630 },
  'Sindhi Colony': { lat: 22.6960, lng: 75.8650 },
  'Ashok Nagar Bhauwarkua Main R.': { lat: 22.6940, lng: 75.8660 },
  'Bhanwarkua Chouraha': { lat: 22.6925, lng: 75.8672 },
  'Bhauwarkua Chouraha': { lat: 22.6925, lng: 75.8672 },
  'Navlakha Chouraha': { lat: 22.7020, lng: 75.8750 },
  'Navlakha Bus Stand (Start)': { lat: 22.7020, lng: 75.8750 },
  'Nemawar Road': { lat: 22.6940, lng: 75.8880 },
  'Teen Imli': { lat: 22.6912, lng: 75.8942 },
  'Teen Imli Square': { lat: 22.6912, lng: 75.8942 },
  'Teen Imali Square': { lat: 22.6912, lng: 75.8942 },
  'Musakhedi': { lat: 22.7050, lng: 75.9080 },
  'Mushakhedi Square': { lat: 22.7050, lng: 75.9080 },
  'Musakhedi Chouraha Inside': { lat: 22.7050, lng: 75.9080 },

  // Group 2: Chhota Bangarda / Banganga / Palasia
  'Vidhya Palace Chhota Bangarda (Start)': { lat: 22.7480, lng: 75.8210 },
  'Yadav Dharmshala': { lat: 22.7490, lng: 75.8270 },
  'Rukmani Nagar': { lat: 22.7500, lng: 75.8340 },
  'Kali Mata Mandir': { lat: 22.7510, lng: 75.8410 },
  'Rambali Nagar': { lat: 22.7530, lng: 75.8470 },
  'Doodh Dairy': { lat: 22.7540, lng: 75.8520 },
  'Sangam Nagar': { lat: 22.7550, lng: 75.8570 },
  'Khada Ganpati': { lat: 22.7520, lng: 75.8630 },
  'Mahesh Guard Line Petrol Pump': { lat: 22.7490, lng: 75.8690 },
  'Banganga Stop Old Naka (Start)': { lat: 22.7480, lng: 75.8720 },
  'Marimata Chouraha': { lat: 22.7420, lng: 75.8670 },
  'Agniban Press Chouraha': { lat: 22.7360, lng: 75.8690 },
  'Rajkumar Bridge (Vallabh Nagar)': { lat: 22.7310, lng: 75.8740 },
  'Malwa Mill': { lat: 22.7290, lng: 75.8780 },
  'Ranisati Gate': { lat: 22.7270, lng: 75.8810 },
  'City Office Chouraha': { lat: 22.7260, lng: 75.8830 },
  'Janjirwala Chouraha': { lat: 22.7250, lng: 75.8840 },
  'Industry House': { lat: 22.7245, lng: 75.8845 },
  'Palasia Thana': { lat: 22.7240, lng: 75.8850 },
  'Palasia Chouraha': { lat: 22.7240, lng: 75.8850 },
  'Palasia Chouraha (Petrol Pump)': { lat: 22.7240, lng: 75.8850 },
  'Palasia Chouraha Thana': { lat: 22.7240, lng: 75.8850 },
  'Khajrana Chouraha': { lat: 22.7350, lng: 75.9010 },
  'Robot Chouraha': { lat: 22.7480, lng: 75.9030 },
  'Malviya Petrol Pump': { lat: 22.7620, lng: 75.9060 },

  // Group 3: RTO Old / Silicon City / IT Park / Tejaji Nagar
  'RTO Old (Start)': { lat: 22.6840, lng: 75.8380 },
  'Lokmanya Nagar': { lat: 22.6890, lng: 75.8360 },
  'Vinay Nagar': { lat: 22.6860, lng: 75.8320 },
  'Keshar Bag Railway Bridge': { lat: 22.6810, lng: 75.8300 },
  'Silicon City': { lat: 22.6450, lng: 75.8190 },
  'Shiv City (Start)': { lat: 22.6480, lng: 75.8150 },
  'Rajendra Nagar Thana': { lat: 22.6710, lng: 75.8290 },
  'Bijalpur Chouraha': { lat: 22.6780, lng: 75.8350 },
  'Gadbadi Pooliya': { lat: 22.6810, lng: 75.8380 },
  'Choithram Mandi Chouraha': { lat: 22.6830, lng: 75.8420 },
  'Rajiv Gandhi Chouraha': { lat: 22.6845, lng: 75.8640 },
  'Vishnupuri Chouraha': { lat: 22.6885, lng: 75.8655 },
  'Indrapuri': { lat: 22.6860, lng: 75.8710 },
  'IT Park Chouraha': { lat: 22.6815, lng: 75.8770 },
  'SDPS College': { lat: 22.6780, lng: 75.8810 },
  'Khandwa Naka Chouraha': { lat: 22.6750, lng: 75.8850 },
  'Palda Road': { lat: 22.6830, lng: 75.8980 },
  'Limbodi Gate Rani Bagh': { lat: 22.6750, lng: 75.9020 },
  'Kampel (Start)': { lat: 22.6350, lng: 75.9350 },
  'Tejaji Nagar': { lat: 22.6680, lng: 75.8920 },

  // Group 4: Indorama / Rau / Bypass
  'Indorama': { lat: 22.6100, lng: 75.7600 },
  'Sagar Kuti': { lat: 22.6150, lng: 75.7720 },
  'Chhatra Chhaya (Main Road)': { lat: 22.6200, lng: 75.7830 },
  'Choupati': { lat: 22.6240, lng: 75.7910 },
  'Chinar/Residency MR': { lat: 22.6270, lng: 75.7980 },
  'Shanti Nagar': { lat: 22.6290, lng: 75.8030 },
  'Dhar Naka': { lat: 22.6310, lng: 75.8060 },
  'Dreamland (Start)': { lat: 22.6280, lng: 75.8010 },
  'Hotel Shyam Vilas': { lat: 22.6300, lng: 75.8040 },
  'Hari Phatak': { lat: 22.6315, lng: 75.8070 },
  'Kishanganj Naka': { lat: 22.6318, lng: 75.8075 },
  'Rau': { lat: 22.6320, lng: 75.8080 },
  'Silver Spring': { lat: 22.6850, lng: 75.9250 },
  'Devguradiya Bypass': { lat: 22.6980, lng: 75.9320 },

  // Group 5: Mhow Naka / Annapurna / IT Park / Pipliyahana
  'Sachidnand Nagar': { lat: 22.7040, lng: 75.8430 },
  'Dashera Maidan': { lat: 22.7010, lng: 75.8410 },
  'Bank Colony Chouraha': { lat: 22.6980, lng: 75.8390 },
  'Anapurna Mandir': { lat: 22.6950, lng: 75.8380 },
  'Mishra Nagar': { lat: 22.6920, lng: 75.8360 },
  'Chanankya Puri Chouraha (Start)': { lat: 22.6890, lng: 75.8340 },
  'Vaishali Nagar Chouraha': { lat: 22.6850, lng: 75.8320 },
  'Rajendra Nagar Railway Station': { lat: 22.6780, lng: 75.8280 },
  'Rajendra Nagar Dutt Mandir': { lat: 22.6740, lng: 75.8295 },
  'Kandhari Julewala A.B. Road': { lat: 22.6730, lng: 75.8305 },
  'Gurudwara Ring Road': { lat: 22.6830, lng: 75.8710 },
  'Piplya Hana Chouraha': { lat: 22.7120, lng: 75.9020 },
  'Piplihana Chouraha': { lat: 22.7120, lng: 75.9020 },
  'JMB': { lat: 22.7180, lng: 75.9080 },
  'Agrawal Public School': { lat: 22.7230, lng: 75.9120 },

  // Group 6: Hatod / Aerodrum / Gangwal / Jawaharmarg
  'Hatod (Start)': { lat: 22.8010, lng: 75.7320 },
  'Gandhi Nagar (Start)': { lat: 22.7520, lng: 75.8010 },
  '60 Ft. Road': { lat: 22.7480, lng: 75.8150 },
  'Sukhdev Nagar (Ring Road)': { lat: 22.7450, lng: 75.8240 },
  'Palhar Nagar Ring Road': { lat: 22.7420, lng: 75.8280 },
  'Aerodrum Thana (Start)': { lat: 22.7380, lng: 75.8310 },
  'Vidhya Dham': { lat: 22.7350, lng: 75.8330 },
  'Kalani Nagar': { lat: 22.7320, lng: 75.8350 },
  'Shikshak Nagar': { lat: 22.7290, lng: 75.8380 },
  'Ramchandra Nagar Petrol Pump': { lat: 22.7250, lng: 75.8420 },
  'Bada Ganpati': { lat: 22.7210, lng: 75.8450 },
  'Vaishnav Polytechnic College MOG Lines (Start)': { lat: 22.7150, lng: 75.8460 },
  'Gangwal Bus Stand (Square)': { lat: 22.7120, lng: 75.8480 },
  'Rajmohalla Chouraha Petrol Pump': { lat: 22.7150, lng: 75.8520 },
  'Malganj Chouraha': { lat: 22.7160, lng: 75.8560 },
  'Narsingh Bazar Chouraha': { lat: 22.7170, lng: 75.8600 },
  'Bartan Bazar Chouraha': { lat: 22.7180, lng: 75.8640 },
  'Gurudwara Jawaharmarg': { lat: 22.7190, lng: 75.8670 },
  'Saifi Hotel': { lat: 22.7200, lng: 75.8700 },
  'District Court MG Road': { lat: 22.7210, lng: 75.8740 },
  'Patel Bridge': { lat: 22.7220, lng: 75.8780 },
  'Patel Pratima': { lat: 22.7225, lng: 75.8795 },
  'Shrimaya Hotel Madhumilan Chou.': { lat: 22.7215, lng: 75.8810 },
  'Dhakkanwala Kua': { lat: 22.7205, lng: 75.8825 },

  // Group 7: Paliya / Aurobindo / MR 10 / Vijay Nagar
  'Paliya Station (Start)': { lat: 22.8050, lng: 75.8450 },
  'Aurbindo Hospital': { lat: 22.7920, lng: 75.8580 },
  'Divya Vihar Colony (Start)': { lat: 22.7850, lng: 75.8650 },
  'Lavkush Chouraha': { lat: 22.7780, lng: 75.8720 },
  'MR 10 Square': { lat: 22.7720, lng: 75.8780 },
  'Heera Nagar Chouraha': { lat: 22.7680, lng: 75.8820 },
  'Bapat Chouraha': { lat: 22.7640, lng: 75.8850 },
  'Maruti Nagar Chouraha (Start)': { lat: 22.7620, lng: 75.8880 },
  'ITI Back Side': { lat: 22.7590, lng: 75.8900 },
  'Clerk Colony': { lat: 22.7570, lng: 75.8910 },
  'Gori Nagar': { lat: 22.7550, lng: 75.8920 },
  'ITI Front Side': { lat: 22.7540, lng: 75.8930 },
  'MR-10 Chouraha': { lat: 22.7580, lng: 75.8920 },
  'Heera Nagar Thana': { lat: 22.7610, lng: 75.8940 },
  'Opposite Fortune Landmark': { lat: 22.7550, lng: 75.8930 },
  'Bhandari Hospital': { lat: 22.7540, lng: 75.8935 },
  'Vijay Nagar': { lat: 22.7533, lng: 75.8937 },
  'Vijay Nagar Thana': { lat: 22.7533, lng: 75.8937 },
  'Hotel Redisson': { lat: 22.7520, lng: 75.8970 },
  'Hotel Redison Chouraha': { lat: 22.7520, lng: 75.8970 },
  'Omaxe City & Bypass': { lat: 22.7780, lng: 75.9250 },

  // Group 8: Niranjanpur / Scheme 78 / Dewas Naka / Mangliya
  'Niranjanpur Chouraha (Start)': { lat: 22.7750, lng: 75.8950 },
  'Nakshatra Garden': { lat: 22.7760, lng: 75.8990 },
  'Rajshree Hospital': { lat: 22.7770, lng: 75.9030 },
  'Food Land': { lat: 22.7780, lng: 75.9060 },
  'Sica School': { lat: 22.7790, lng: 75.9080 },
  'Ashish Nursing Home (Start)': { lat: 22.7720, lng: 75.9050 },
  'Scheme No. 74 Main Road': { lat: 22.7680, lng: 75.9040 },
  'Scheme No. 78 Nai Sadak': { lat: 22.7640, lng: 75.9030 },
  'Dewas Naka': { lat: 22.7845, lng: 75.9125 },
  'Patel Motors': { lat: 22.7920, lng: 75.9190 },
  'Panchvati': { lat: 22.8010, lng: 75.9260 },
  'Ansal Township / Talawali Chanda': { lat: 22.8090, lng: 75.9320 },
  'Mangliya Village': { lat: 22.8150, lng: 75.9380 },

  // Group 9: Sun City / Mahalaxmi Nagar / Bombay Hospital
  'Sun City (Start)': { lat: 22.7680, lng: 75.9180 },
  'County Park': { lat: 22.7650, lng: 75.9120 },
  'Nariman Point': { lat: 22.7630, lng: 75.9080 },
  'Sai Mandir': { lat: 22.7620, lng: 75.9040 },
  'Mela Ground': { lat: 22.7610, lng: 75.9010 },
  'Mahalaxmi Nagar Gate': { lat: 22.7600, lng: 75.8990 },
  'Uttam Bhog': { lat: 22.7595, lng: 75.8985 },
  'Bombay Hospital': { lat: 22.7610, lng: 75.8980 },
  'Reliance Fresh': { lat: 22.7630, lng: 75.8985 },
  'Satyasai': { lat: 22.7670, lng: 75.8995 },
  'Shalimar Palms AB Road': { lat: 22.7720, lng: 75.9020 },
  'Mahindra Showroom': { lat: 22.7780, lng: 75.9060 },
  'Gulab Baag': { lat: 22.7890, lng: 75.9180 },

  // Group 10: Bhamori / Pardeshipura / LIG / Vijay Nagar
  'Bhamori Plaza (Start)': { lat: 22.7480, lng: 75.8820 },
  'Astha Talkies': { lat: 22.7450, lng: 75.8790 },
  'Bhandari Bridge Thana (Start)': { lat: 22.7410, lng: 75.8760 },
  'Subhash Nagar': { lat: 22.7380, lng: 75.8740 },
  'Pardeshipura': { lat: 22.7360, lng: 75.8760 },
  'Nanda Nagar Teen Puliya': { lat: 22.7420, lng: 75.8810 },
  'Nanda Nagar': { lat: 22.7440, lng: 75.8840 },
  'Patnipura': { lat: 22.7390, lng: 75.8830 },
  'Atal Dwar': { lat: 22.7360, lng: 75.8840 },
  'Christian Eminent School': { lat: 22.7370, lng: 75.8845 },
  'LIG Square (Start)': { lat: 22.7380, lng: 75.8850 },
  'Press Complex': { lat: 22.7420, lng: 75.8890 },
  'Malviya Nagar Chouraha': { lat: 22.7450, lng: 75.8920 },
  'Barfani Dham': { lat: 22.7490, lng: 75.8960 },
  'Rasoma Chouraha': { lat: 22.7510, lng: 75.8950 },

  // Group 11: Navlakha / Geeta Bhawan / Bengali / Kanadiya
  'GPO Chouraha Petrol Pump': { lat: 22.7090, lng: 75.8710 },
  'Jaora Compound (BJP Office)': { lat: 22.7120, lng: 75.8740 },
  'M.Y. Chauraha': { lat: 22.7140, lng: 75.8760 },
  'St. Paul School (Start)': { lat: 22.7130, lng: 75.8790 },
  'Shivaji Vatika': { lat: 22.7140, lng: 75.8810 },
  'Mahatma Gandhi Medical College': { lat: 22.7150, lng: 75.8820 },
  'Geeta Bhawan Chouraha (Start)': { lat: 22.7160, lng: 75.8830 },
  'Badwani Plaza': { lat: 22.7230, lng: 75.8880 },
  'Patrakar Chouraha': { lat: 22.7220, lng: 75.8930 },
  'Kanadia Road Sabji Mandi': { lat: 22.7210, lng: 75.8980 },
  'Telephone Chouraha': { lat: 22.7200, lng: 75.9020 },
  'Kanadiya Village (Start)': { lat: 22.7180, lng: 75.9180 },
  'Bengali Chouraha': { lat: 22.7215, lng: 75.9065 },
  'Vaibhav Nagar Chouraha': { lat: 22.7210, lng: 75.9120 },
  'Sanchar Nagar': { lat: 22.7200, lng: 75.9160 },
  'Manavta Nagar Chouraha': { lat: 22.7190, lng: 75.9220 },
  'Kanadiya Bypass': { lat: 22.7220, lng: 75.9320 },
  'Jhalariya Village': { lat: 22.7450, lng: 75.9380 },

  // Group 12: Tilak Nagar / Bengali / Kanadiya Bypass
  'Tilak Nagar Jain Mandir (Start)': { lat: 22.7180, lng: 75.8950 },
  'Telephone Nagar Tempo Stand (Start)': { lat: 22.7190, lng: 75.9010 },
  'Mahavir Nagar': { lat: 22.7200, lng: 75.9040 },
  'Adarsh Shishu Viahar School': { lat: 22.7220, lng: 75.9120 },
  'Columbia Convent School': { lat: 22.7230, lng: 75.9210 },

  // Group 13: Jhinsi / Rambag / Regal / Palasia / Khajrana
  'Jhinsi Chouraha (Start)': { lat: 22.7280, lng: 75.8520 },
  'Neelkanth Colony Chouraha (Badwani Chowki)': { lat: 22.7260, lng: 75.8560 },
  'Imli Bazar': { lat: 22.7240, lng: 75.8590 },
  'Rambag Chouraha': { lat: 22.7220, lng: 75.8630 },
  'Malhar Ashram': { lat: 22.7210, lng: 75.8660 },
  'Rambag Lokhandepul': { lat: 22.7200, lng: 75.8680 },
  'Nagar Nigam Chouraha': { lat: 22.7190, lng: 75.8710 },
  'Chikmangalur Chouraha (Jail Road)': { lat: 22.7180, lng: 75.8740 },
  'Rajkumar Bridge': { lat: 22.7300, lng: 75.8750 },
  'Vallabh Nagar (Start)': { lat: 22.7310, lng: 75.8760 },
  'Regal Chouraha': { lat: 22.7200, lng: 75.8790 },
  'Rajani Bhawan M.G. Road': { lat: 22.7210, lng: 75.8810 },
  'Infront of T.I.': { lat: 22.7220, lng: 75.8830 },
  'Indraprastha Tower': { lat: 22.7230, lng: 75.8840 },
  'Saket Pan Corner': { lat: 22.7270, lng: 75.8920 },
  'Anand Bazar': { lat: 22.7290, lng: 75.8960 },
  'Chandralok Chouraha': { lat: 22.7310, lng: 75.8980 },
  'Khajarana Mandir': { lat: 22.7380, lng: 75.9050 },
  'Zum Zum Chouraha': { lat: 22.7420, lng: 75.9080 },
  'Chitragupt Chouraha (Star Chouraha)': { lat: 22.7460, lng: 75.9120 },

  // Group 14: Six Bunglow / Manik Bagh / Sapna Sangeeta / Piplihana
  'Six Bunglow Sitla Mata Mandir (Start)': { lat: 22.6960, lng: 75.8520 },
  'Reliance Fresh Manik Bagh': { lat: 22.6980, lng: 75.8550 },
  'Manik Bagh Bridge': { lat: 22.6990, lng: 75.8580 },
  'Khatiwala Tank': { lat: 22.7010, lng: 75.8620 },
  'Tower Chouraha': { lat: 22.7030, lng: 75.8660 },
  'Sapna Sangeeta': { lat: 22.7050, lng: 75.8690 },
  'Lotus': { lat: 22.7070, lng: 75.8720 },
  'Agrasen Chouraha': { lat: 22.7090, lng: 75.8750 },
  'Azad Nagar Chouraha': { lat: 22.7080, lng: 75.8880 },
  'Daily College': { lat: 22.7110, lng: 75.8930 },
  'Agriculture College Chouraha': { lat: 22.7130, lng: 75.8970 },
  'Hanuman Mandir Ring Road': { lat: 22.7160, lng: 75.9040 },

  // Group 15: Bada Nagda / Balgarh / Shipra / Dakachya
  'Bada Nagda (Start)': { lat: 22.9800, lng: 76.0850 },
  'Pal Nagar': { lat: 22.9750, lng: 76.0780 },
  'Bypass': { lat: 22.9700, lng: 76.0700 },
  'Chuna Khadan': { lat: 22.9680, lng: 76.0650 },
  'Anatpura': { lat: 22.9660, lng: 76.0620 },
  'Balgarh': { lat: 22.9640, lng: 76.0590 },
  'Ganesh Puri': { lat: 22.9620, lng: 76.0550 },
  'Stand Doss Bunglow': { lat: 22.9600, lng: 76.0520 },
  'Mera Bawri': { lat: 22.9580, lng: 76.0490 },
  'Nagda (Start)': { lat: 22.9780, lng: 76.0820 },
  'Balgad': { lat: 22.9640, lng: 76.0590 },
  'Atal Chourah': { lat: 22.9610, lng: 76.0540 },
  'MeeraBawdi': { lat: 22.9580, lng: 76.0490 },
  'Ramnagar': { lat: 22.9450, lng: 76.0350 },
  'Kela Devi': { lat: 22.9400, lng: 76.0300 },
  'Shipra': { lat: 22.9230, lng: 75.9910 },

  // Group 16: Nagukhedi / Civil Line / Kela Devi / Kshipra
  'Nagukhedi (Start)': { lat: 22.9850, lng: 76.0450 },
  'Kamla Nagar': { lat: 22.9800, lng: 76.0480 },
  'Trilok Nagar': { lat: 22.9750, lng: 76.0500 },
  'Itawa': { lat: 22.9720, lng: 76.0520 },
  'Bima Chouraha (Start)': { lat: 22.9680, lng: 76.0540 },
  'Saraswati School': { lat: 22.9650, lng: 76.0530 },
  'Sawaria Dairy': { lat: 22.9620, lng: 76.0520 },
  'Pioneer School': { lat: 22.9590, lng: 76.0500 },
  'Karmdeep School (Start)': { lat: 22.9570, lng: 76.0480 },
  'Civil Line': { lat: 22.9550, lng: 76.0460 },
  'Sayaji Gate': { lat: 22.9530, lng: 76.0440 },
  'Ujjain Road Bridge': { lat: 22.9510, lng: 76.0420 },
  'Petrol Pump Chouraha': { lat: 22.9490, lng: 76.0400 },
  'Lal Gate Saiyaji Dwar': { lat: 22.9530, lng: 76.0450 },
  'Apex Hospital': { lat: 22.9420, lng: 76.0330 },
  'Kela Devi Jawahar Nagar': { lat: 22.9400, lng: 76.0300 },
  'Hero Honda Showroom': { lat: 22.9380, lng: 76.0260 },
  'Bavdiya': { lat: 22.9300, lng: 76.0100 },
  'Bavadiya': { lat: 22.9300, lng: 76.0100 },
  'Arjun Badoda': { lat: 22.8750, lng: 75.9700 },

  // Group 17: Datana / Narwar / Etawa / Kshipra
  'Datana (Start)': { lat: 23.0450, lng: 75.9850 },
  'Semliya Phata': { lat: 23.0300, lng: 75.9920 },
  'Narwar': { lat: 23.0150, lng: 76.0050 },
  'Achnariya': { lat: 23.0020, lng: 76.0180 },
  'Palkhanda': { lat: 22.9920, lng: 76.0280 },
  'Bangar': { lat: 22.9860, lng: 76.0350 },
  'Singawda': { lat: 22.9820, lng: 76.0400 },
  'Mangawda (Gaushala)': { lat: 22.9790, lng: 76.0420 },
  'Nagukhedi (Bypass)': { lat: 22.9850, lng: 76.0450 },
  'Etawa': { lat: 22.9720, lng: 76.0520 },
  'Bima Chaurha': { lat: 22.9680, lng: 76.0540 },
  'Pump Chaurha': { lat: 22.9490, lng: 76.0400 },

  // Group 18: Barotha / Bhopal Chouraha / Ujjain Chouraha / Shipra
  'Barotha Village (Start)': { lat: 22.9800, lng: 76.1200 },
  'Siroliya': { lat: 22.9780, lng: 76.1050 },
  'Napakhedi': { lat: 22.9750, lng: 76.0950 },
  'Rajoda': { lat: 22.9720, lng: 76.0850 },
  'Kailod Phata': { lat: 22.9690, lng: 76.0780 },
  'Golden Chouraha Jaitpura': { lat: 22.9650, lng: 76.0720 },
  'Radha Ganj': { lat: 22.9650, lng: 76.0540 },
  'Ram Rahim Chauraha': { lat: 22.9630, lng: 76.0580 },
  'Chidawat (Start)': { lat: 22.9750, lng: 76.0900 },
  'Bilawali (Doodh Dairy)': { lat: 22.9550, lng: 76.0350 },
  'Bamankheda': { lat: 22.8800, lng: 75.9800 },
  'Giriaj Dham': { lat: 22.9580, lng: 76.0420 },
  'Jamuna Nagar': { lat: 22.9560, lng: 76.0450 },
  'Tulja Vihar': { lat: 22.9540, lng: 76.0470 },
  'Awas Nagar Gate': { lat: 22.9520, lng: 76.0480 },
  'BNP Thana': { lat: 22.9500, lng: 76.0490 },
  'Anaj Mandi': { lat: 22.9480, lng: 76.0510 },
  'Vishram Bagh': { lat: 22.9460, lng: 76.0520 },
  'Hotel Natraj': { lat: 22.9580, lng: 76.0530 },
  'Ujjain Chouraha': { lat: 22.9560, lng: 76.0480 },
  'Jawahar Nagar': { lat: 22.9410, lng: 76.0310 },
  'Lohar Pipliya': { lat: 22.9220, lng: 75.9930 },
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
