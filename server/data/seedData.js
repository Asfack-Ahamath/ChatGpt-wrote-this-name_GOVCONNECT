const Department = require('../models/Department');
const Service = require('../models/Service');
const User = require('../models/User');

const departments = [
  {
    name: 'Department of Motor Traffic',
    nameInSinhala: 'මෝටර් රථ ගමනාගමන දෙපාර්තමේන්තුව',
    nameInTamil: 'மோட்டார் போக்குவரத்துத் துறை',
    code: 'DMT',
    description: 'Issues driving licenses, vehicle registrations, and related services',
    location: {
      address: 'No. 30, Railway Avenue',
      city: 'Colombo',
      district: 'Colombo',
      province: 'Western Province'
    },
    contactInfo: {
      phone: '011-2691141',
      email: 'info@dmt.gov.lk',
      website: 'https://www.dmt.gov.lk'
    },
    workingHours: {
      monday: { start: '08:00', end: '16:30' },
      tuesday: { start: '08:00', end: '16:30' },
      wednesday: { start: '08:00', end: '16:30' },
      thursday: { start: '08:00', end: '16:30' },
      friday: { start: '08:00', end: '16:30' },
      saturday: { start: '08:00', end: '12:30' },
      sunday: { start: '', end: '' }
    }
  },
  {
    name: 'Department of Immigration & Emigration',
    nameInSinhala: 'ආගමන හා විගමන දෙපාර්තමේන්තුව',
    nameInTamil: 'குடியேற்றம் மற்றும் குடிபெயர்வுத் துறை',
    code: 'DIE',
    description: 'Handles passport applications, visa services, and immigration matters',
    location: {
      address: '41, Ananda Rajakaruna Mawatha',
      city: 'Colombo 10',
      district: 'Colombo',
      province: 'Western Province'
    },
    contactInfo: {
      phone: '011-5329100',
      email: 'info@immigration.gov.lk',
      website: 'https://www.immigration.gov.lk'
    },
    workingHours: {
      monday: { start: '08:00', end: '16:30' },
      tuesday: { start: '08:00', end: '16:30' },
      wednesday: { start: '08:00', end: '16:30' },
      thursday: { start: '08:00', end: '16:30' },
      friday: { start: '08:00', end: '16:30' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' }
    }
  },
  {
    name: 'Registrar General\'s Department',
    nameInSinhala: 'රෙජිස්ට්‍රාර් ජනරාල් දෙපාර්තමේන්තුව',
    nameInTamil: 'பதிவாளர் நாயகம் திணைக்களம்',
    code: 'RGD',
    description: 'Birth, death, marriage certificates and civil registration services',
    location: {
      address: 'No. 02, N.R. Ranathunga Mawatha',
      city: 'Colombo 05',
      district: 'Colombo',
      province: 'Western Province'
    },
    contactInfo: {
      phone: '011-2691141',
      email: 'info@rgd.gov.lk',
      website: 'https://www.rgd.gov.lk'
    },
    workingHours: {
      monday: { start: '08:00', end: '16:30' },
      tuesday: { start: '08:00', end: '16:30' },
      wednesday: { start: '08:00', end: '16:30' },
      thursday: { start: '08:00', end: '16:30' },
      friday: { start: '08:00', end: '16:30' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' }
    }
  },
  {
    name: 'National Identity Card Department',
    nameInSinhala: 'ජාතික හැඳුනුම්පත් දෙපාර්තමේන්තුව',
    nameInTamil: 'தேசிய அடையாள அட்டை திணைக்களம்',
    code: 'NIC',
    description: 'National Identity Card issuance and related services',
    location: {
      address: '04, Rajamalwatta Road',
      city: 'Battaramulla',
      district: 'Colombo',
      province: 'Western Province'
    },
    contactInfo: {
      phone: '011-2877801',
      email: 'info@nic.gov.lk',
      website: 'https://www.nic.gov.lk'
    },
    workingHours: {
      monday: { start: '08:00', end: '16:30' },
      tuesday: { start: '08:00', end: '16:30' },
      wednesday: { start: '08:00', end: '16:30' },
      thursday: { start: '08:00', end: '16:30' },
      friday: { start: '08:00', end: '16:30' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' }
    }
  },
  {
    name: 'Department of Inland Revenue',
    nameInSinhala: 'අභ්‍යන්තර ආදායම් දෙපාර්තමේන්තුව',
    nameInTamil: 'உள்நாட்டு வருவாய்த் துறை',
    code: 'IRD',
    description: 'Tax registration, assessments, and revenue collection services',
    location: {
      address: 'No. 90, Galle Road',
      city: 'Colombo 03',
      district: 'Colombo',
      province: 'Western Province'
    },
    contactInfo: {
      phone: '011-2427500',
      email: 'info@ird.gov.lk',
      website: 'https://www.ird.gov.lk'
    },
    workingHours: {
      monday: { start: '08:00', end: '16:30' },
      tuesday: { start: '08:00', end: '16:30' },
      wednesday: { start: '08:00', end: '16:30' },
      thursday: { start: '08:00', end: '16:30' },
      friday: { start: '08:00', end: '16:30' },
      saturday: { start: '', end: '' },
      sunday: { start: '', end: '' }
    }
  }
];

const services = [
  // DMT Services
  {
    name: 'Driving License Application',
    nameInSinhala: 'රියැදුරු බලපත්‍ර අයදුම්පත',
    nameInTamil: 'ஓட்டுநர் உரிமம் விண்ணப்பம்',
    code: 'DMT-DL-NEW',
    department: 'DMT',
    description: 'Apply for a new driving license',
    category: 'license_permits',
    requiredDocuments: [
      {
        name: 'National Identity Card',
        description: 'Valid NIC or passport',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG', 'PNG']
      },
      {
        name: 'Medical Certificate',
        description: 'Medical fitness certificate',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      },
      {
        name: 'Application Form',
        description: 'Completed driving license application form',
        isMandatory: true,
        acceptedFormats: ['PDF']
      }
    ],
    processingTime: {
      estimatedDays: 14,
      description: 'Processing time after successful completion of driving test'
    },
    fees: {
      amount: 2500,
      currency: 'LKR',
      description: 'Application fee for new driving license'
    },
    appointmentDuration: 45,
    maxAdvanceBookingDays: 60
  },
  {
    name: 'Vehicle Registration',
    nameInSinhala: 'වාහන ලියාපදිංචිය',
    nameInTamil: 'வாகனம் பதிவு',
    code: 'DMT-VR-NEW',
    department: 'DMT',
    description: 'Register a new or imported vehicle',
    category: 'registration',
    requiredDocuments: [
      {
        name: 'Import Permit',
        description: 'Vehicle import permit from Sri Lanka Customs',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      },
      {
        name: 'Invoice',
        description: 'Purchase invoice or bill of sale',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      },
      {
        name: 'Insurance Certificate',
        description: 'Valid vehicle insurance certificate',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      }
    ],
    processingTime: {
      estimatedDays: 7,
      description: 'Processing time after document verification'
    },
    fees: {
      amount: 15000,
      currency: 'LKR',
      description: 'Vehicle registration fee (varies by vehicle type)'
    },
    appointmentDuration: 60,
    maxAdvanceBookingDays: 30
  },
  // Immigration Services
  {
    name: 'Passport Application',
    nameInSinhala: 'ගමන් බලපත්‍ර අයදුම්පත',
    nameInTamil: 'கடவுச்சீட்டு விண்ணப்பம்',
    code: 'DIE-PP-NEW',
    department: 'DIE',
    description: 'Apply for a new Sri Lankan passport',
    category: 'applications',
    requiredDocuments: [
      {
        name: 'Birth Certificate',
        description: 'Original birth certificate',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      },
      {
        name: 'National Identity Card',
        description: 'Valid NIC',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      },
      {
        name: 'Application Form',
        description: 'Completed passport application form',
        isMandatory: true,
        acceptedFormats: ['PDF']
      }
    ],
    processingTime: {
      estimatedDays: 21,
      description: 'Standard processing time for new passport'
    },
    fees: {
      amount: 3500,
      currency: 'LKR',
      description: 'Passport application fee'
    },
    appointmentDuration: 30,
    maxAdvanceBookingDays: 45
  },
  // RGD Services
  {
    name: 'Birth Certificate',
    nameInSinhala: 'උප්පැන්න සහතිකය',
    nameInTamil: 'பிறப்புச் சான்றிதழ்',
    code: 'RGD-BC-NEW',
    department: 'RGD',
    description: 'Obtain a certified copy of birth certificate',
    category: 'certificates',
    requiredDocuments: [
      {
        name: 'Application Form',
        description: 'Completed birth certificate application form',
        isMandatory: true,
        acceptedFormats: ['PDF']
      },
      {
        name: 'Identity Proof',
        description: 'NIC or other valid identification',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      }
    ],
    processingTime: {
      estimatedDays: 3,
      description: 'Processing time for certified copy'
    },
    fees: {
      amount: 100,
      currency: 'LKR',
      description: 'Fee for certified copy of birth certificate'
    },
    appointmentDuration: 15,
    maxAdvanceBookingDays: 30
  },
  // NIC Services
  {
    name: 'National Identity Card Application',
    nameInSinhala: 'ජාතික හැඳුනුම්පත් අයදුම්පත',
    nameInTamil: 'தேசிய அடையாள அட்டை விண்ணப்பம்',
    code: 'NIC-IC-NEW',
    department: 'NIC',
    description: 'Apply for new National Identity Card',
    category: 'applications',
    requiredDocuments: [
      {
        name: 'Birth Certificate',
        description: 'Original birth certificate',
        isMandatory: true,
        acceptedFormats: ['PDF', 'JPG']
      },
      {
        name: 'Application Form',
        description: 'Completed NIC application form',
        isMandatory: true,
        acceptedFormats: ['PDF']
      }
    ],
    processingTime: {
      estimatedDays: 14,
      description: 'Processing time for new NIC'
    },
    fees: {
      amount: 500,
      currency: 'LKR',
      description: 'NIC application fee'
    },
    appointmentDuration: 20,
    maxAdvanceBookingDays: 60
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    await Department.deleteMany({});
    await Service.deleteMany({});
    console.log('🗑️ Cleared existing data');

    const createdDepartments = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepartments.length} departments`);

    const servicesWithDeptIds = services.map(service => {
      const department = createdDepartments.find(dept => dept.code === service.department);
      return {
        ...service,
        department: department._id
      };
    });

    const createdServices = await Service.insertMany(servicesWithDeptIds);
    console.log(`✅ Created ${createdServices.length} services`);

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

module.exports = { seedDatabase, departments, services };