import axios from 'axios';
import dotenv from 'dotenv';
import Vehicle from '../models/Vehicle.js';

// Load environment variables from .env file.
dotenv.config();

/**
 * Common error handler for controller responses.
 * @param {Object} res - Express response object.
 * @param {Error} error - The error object.
 * @param {string} message - Custom error message.
 */
const handleError = (res, error, message) => {
  console.error(message, error?.message);
  res.status(500).json({ message, error: error?.message });
};

export const getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!vehicles) {
      return res.status(404).json({ message: 'No vehicles found' });
    };
    res.status(200).json({ message: 'Vehicles retrieved successfully', vehicles: vehicles });
  } catch (error) {
    handleError(res, error, 'Error getting vehicles');
  };
};

export const getDeletedVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isDeleted: true }).sort({ dateDeleted: -1 });
    res.status(200).json({ message: 'Vehicles retrieved successfully', vehicles: vehicles });
  } catch (error) {
    handleError(res, error, 'Error getting deleted vehicles');
  };
};

export const getVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    };
    res.status(200).json({ message: 'Vehicle retrieved successfully', vehicle: vehicle });
  } catch (error) {
    handleError(res, error, 'Error getting vehicle');
  };
};

export const createVehicleREG = async (req, res) => {
  try {
    // DVLA API integration using the registration number provided in the request body
    const { id: registrationNumber } = req.params;
    const liveApi = process.env.APIkey;
    const DVLAURIlive = 'https://history.mot.api.gov.uk/v1/trade/vehicles/registration';
    let accessToken = '';

    // Access token from Microsoft Identity Platform using the client credentials flow parameters from .env file
    const microstoftTokenURL = process.env.TokenURL;
    const clientId = process.env.ClientID;
    const clientSecret = process.env.ClientSecret;
    const scopeURL = process.env.ScopeURL;
    let headers = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
    };    
    let payload = { 
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scopeURL    
    };  
    console.log('Requesting access token from Microsoft Identity Platform...');
    const { data: accessTokenData } = await axios.post(microstoftTokenURL, payload, headers);    

    // Extract access token from response and check if it exists
    accessToken = accessTokenData.access_token;
    if (!accessToken) {throw new Error('Failed to obtain access token'); }

    // Make request to DVLA API with the access token in the Authorization header
    console.log(`Requesting vehicle data from DVLA API for registration number: ${registrationNumber}...`);
    headers = {
      headers: {
        accept: 'application/json',
        'x-api-key': liveApi,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    // Request vehicle data from DVLA API and check if response contains expected data before proceeding
    const { data } = await axios.get(`${DVLAURIlive}/${registrationNumber}`, headers);
    if (!data?.registration) { throw new Error('Invalid response from DVLA API'); }

    console.log('Creating new vehicle with registration number:', data.registration);
    
    // Create a new vehicle document in the database using the data from the DVLA API response
    const newVehicle = new Vehicle({
      registration: data?.registration || 'Unknown Registration Number', 
      vin: data?.vin || 'Unknown VIN',
      make: data?.make || 'Unknown Make',
      model: data?.model || 'Unknown Model',
      firstUsedDate: data?.firstUsedDate || 'Unknown First Used Date',
      fuelType: data?.fuelType || 'Unknown Fuel Type',
      primaryColour: data?.primaryColour || 'Unknown Primary Colour',
      registrationDate: data?.registrationDate || 'Unknown Registration Date',
      manufactureDate: data?.manufactureDate || 'Unknown Manufacture Date',
      engineSize: data?.engineSize || 'Unknown Engine Size',
      hasOutstandingRecall: data?.hasOutstandingRecall || 'false',
      motTests: data?.motTests || [], 
      customNotes: '',
      createdBy: null,
    }); 
    await newVehicle.save();

    res.status(200).json({ message: 'Vehicle created successfully', newVehicle: newVehicle });
  } catch (error) {
    // console.log("Error creating vehicle:", error);
    handleError(res, error, 'Error creating vehicle');
  };
};

export const createVehicleVIN = async (req, res) => {
  try {
    // DVLA API integration using the registration number provided in the request body
    const { id: VIN } = req.params;
    const liveApi = process.env.APIkey;
    const DVLAURIlive = 'https://history.mot.api.gov.uk/v1/trade/vehicles/vin';
    let accessToken = '';

    // Access token from Microsoft Identity Platform using the client credentials flow parameters from .env file
    const microstoftTokenURL = process.env.TokenURL;
    const clientId = process.env.ClientID;
    const clientSecret = process.env.ClientSecret;
    const scopeURL = process.env.ScopeURL;
    let headers = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
    };    
    let payload = { 
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scopeURL    
    };  
    console.log('Requesting access token from Microsoft Identity Platform...');
    const { data: accessTokenData } = await axios.post(microstoftTokenURL, payload, headers);    

    // Extract access token from response and check if it exists
    accessToken = accessTokenData.access_token;
    if (!accessToken) {throw new Error('Failed to obtain access token'); }

    // Make request to DVLA API with the access token in the Authorization header
    console.log(`Requesting vehicle data from DVLA API for registration number: ${VIN}...`);
    headers = {
      headers: {
        accept: 'application/json',
        'x-api-key': liveApi,
        Authorization: `Bearer ${accessToken}`,
      },
    };

    // Request vehicle data from DVLA API and check if response contains expected data before proceeding
    const { data } = await axios.get(`${DVLAURIlive}/${VIN}`, headers);
    if (!data?.registration) { throw new Error('Invalid response from DVLA API'); }

    console.log('Creating new vehicle with registration number:', data.registration);
    
    // Create a new vehicle document in the database using the data from the DVLA API response
    const newVehicle = new Vehicle({
      registration: data?.registration || 'Unknown Registration Number', 
      vin: VIN || 'Unknown VIN',
      make: data?.make || 'Unknown Make',
      model: data?.model || 'Unknown Model',
      firstUsedDate: data?.firstUsedDate || 'Unknown First Used Date',
      fuelType: data?.fuelType || 'Unknown Fuel Type',
      primaryColour: data?.primaryColour || 'Unknown Primary Colour',
      registrationDate: data?.registrationDate || 'Unknown Registration Date',
      manufactureDate: data?.manufactureDate || 'Unknown Manufacture Date',
      engineSize: data?.engineSize || 'Unknown Engine Size',
      hasOutstandingRecall: data?.hasOutstandingRecall || 'false',
      motTests: data?.motTests || [], 
      customNotes: '',
      createdBy: null,
    }); 
    await newVehicle.save();

    res.status(200).json({ message: 'Vehicle created successfully', newVehicle: newVehicle });
  } catch (error) {
    console.log("Error creating vehicle:", error);
    handleError(res, error, 'Error creating vehicle');
  };
};

export const updateAVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { customNotes } = req.body;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    vehicle.customNotes = customNotes || vehicle.customNotes;
    await vehicle.save();
    res.status(200).json({ message: 'Vehicle updated successfully', vehicle: vehicle });
  } catch (error) {
    handleError(res, error, 'Error updating vehicle');
  };
};

export const deleteAVehicle = async (req, res) => {
  try {
    console.log('Received request to delete vehicle with ID:', req?.params?.id, 'and hardDelete flag:', req?.body?.hardDelete);
    const { id } = req?.params;
    const { hardDelete } = req?.body;

    let vehicle;
    if (hardDelete) {
      vehicle = await Vehicle.findByIdAndDelete({ _id: id });
    } else {
      vehicle = await Vehicle.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedBy: null, dateDeleted: new Date() }, { new: true });
    }
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    };
    res.status(200).json({ message: 'Vehicle deleted successfully', vehicle: vehicle });
  } catch (error) {
    console.log("Error deleting vehicle:", error);
    handleError(res, error, 'Error deleting vehicle');
  };
};

export const hardDeleteAVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findByIdAndDelete(id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    };
    res.status(200).json({ message: 'Vehicle permanently deleted successfully', vehicle: vehicle });
  } catch (error) {
    handleError(res, error, 'Error deleting vehicle');
  };
};

export const restoreAVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOneAndUpdate({ _id: id }, { isDeleted: false, deletedBy: null, dateDeleted: null }, { new: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json({ message: 'Vehicle restored successfully', vehicle: vehicle });
  } catch (error) {
    handleError(res, error, 'Error updating vehicle');
  };
};

export const createTestDataSet = async (req, res) => {
  try {

  function generateVehicles(count = 1000) {
  const makes = {
    FORD: [
      "FIESTA", "FOCUS", "MONDEO", "KUGA",
      "PUMA", "ECOSPORT", "S-MAX", "GALAXY"
    ],
    VAUXHALL: [
      "CORSA", "ASTRA", "INSIGNIA",
      "MOKKA", "CROSSLAND", "GRANDLAND"
    ],
    VOLKSWAGEN: [
      "GOLF", "POLO", "PASSAT",
      "TIGUAN", "TOUAREG", "T-ROC"
    ],
    BMW: [
      "1 SERIES", "3 SERIES", "5 SERIES",
      "X1", "X3", "X5"
    ],
    AUDI: [
      "A1", "A3", "A4",
      "Q2", "Q3", "Q5"
    ],
    "MERCEDES-BENZ": [
      "A-CLASS", "C-CLASS", "E-CLASS",
      "GLA", "GLC", "GLE"
    ],
    TOYOTA: [
      "YARIS", "COROLLA", "PRIUS",
      "RAV4", "AYGO"
    ],
    NISSAN: [
      "MICRA", "QASHQAI", "JUKE",
      "LEAF", "X-TRAIL"
    ],
    HYUNDAI: [
      "I10", "I20", "I30",
      "TUCSON", "KONA"
    ],
    KIA: [
      "PICANTO", "RIO", "CEED",
      "SPORTAGE", "NIRO"
    ],
    TESLA: [
      "MODEL S", "MODEL 3", "MODEL X", "MODEL Y"
    ],
    PEUGEOT: [
      "108", "208", "308",
      "2008", "3008", "5008"
    ],
    SKODA: [
      "FABIA", "OCTAVIA", "SUPERB",
      "KAMIQ", "KODIAQ"
    ],
    VOLVO: [
      "V40", "V60", "XC40",
      "XC60", "XC90"
    ]
  };

  const fuels = ["PETROL", "DIESEL", "ELECTRIC", "HYBRID ELECTRIC"];
  const colours = ["BLACK", "WHITE", "BLUE", "GREY", "RED", "SILVER"];

  const letters = "ABCDEFGHJKLMNPRSTUVWXYZ"; // no I,O,Q
  const numbers = "0123456789";

  const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const randomPlate = () => {
    const randLetter = () => letters[Math.floor(Math.random() * letters.length)];
    const randNumber = () => numbers[Math.floor(Math.random() * numbers.length)];

    return (
      randLetter() + randLetter() +
      randNumber() + randNumber() +
      randLetter() + randLetter() + randLetter()
    );
  };

  const randomVIN = () => {
    let vin = "";
    for (let i = 0; i < 17; i++) {
      vin += Math.random() > 0.5
        ? letters[Math.floor(Math.random() * letters.length)]
        : numbers[Math.floor(Math.random() * numbers.length)];
    }
    return vin;
  };

  const randomDateBetween = (startYear = 2001) => {
    const start = new Date(startYear, 0, 1);
    const end = new Date();
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  };

  const formatDate = (date) => date.toISOString().split("T")[0];

  const generateMotTests = (firstUsedDate) => {
    const tests = [];
    const firstYear = new Date(firstUsedDate).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - firstYear;

    if (age < 3) return [];

    const numberOfTests = Math.floor(Math.random() * Math.min(age - 2, 5));

    for (let i = 0; i < numberOfTests; i++) {
      const testDate = randomDateBetween(firstYear + 3);
      tests.push({
        testDate: formatDate(testDate),
        result: rand(["PASSED", "FAILED"]),
        mileage: Math.floor(Math.random() * 150000)
      });
    }

    return tests.sort((a, b) => new Date(a.testDate) - new Date(b.testDate));
  };

  const seenRegs = new Set();
  const vehicles = [];

  while (vehicles.length < count) {
    const registration = randomPlate();
    if (seenRegs.has(registration)) continue;
    seenRegs.add(registration);

    const make = rand(Object.keys(makes));
    const model = rand(makes[make]);

    const manufactureDateObj = randomDateBetween(2001);
    const registrationDateObj = new Date(manufactureDateObj);
    registrationDateObj.setMonth(
      registrationDateObj.getMonth() + Math.floor(Math.random() * 6)
    );

    const firstUsedDateObj = new Date(registrationDateObj);

    const fuelType =
      make === "TESLA"
        ? "ELECTRIC"
        : rand(fuels);

    const isDeleted = Math.random() < 0.03;
    const dateDeleted = isDeleted ? randomDateBetween(2022) : null;

    const vehicle = {
      registration,
      vin: randomVIN(),
      make,
      model,
      firstUsedDate: formatDate(firstUsedDateObj),
      fuelType,
      primaryColour: rand(colours),
      registrationDate: formatDate(registrationDateObj),
      manufactureDate: formatDate(manufactureDateObj),
      engineSize:
        fuelType === "ELECTRIC"
          ? null
          : (Math.floor(Math.random() * 2000) + 1000).toString(),
      hasOutstandingRecall: rand(["YES", "NO"]),
      motTests: generateMotTests(firstUsedDateObj),
      customNotes: Math.random() < 0.1 ? "Customer flagged for review" : "",
      isDeleted,
      dateDeleted,
    };

    vehicles.push(vehicle);
  }

  return vehicles;
  }

  const vehicles = generateVehicles(1000);

  await Vehicle.insertMany(vehicles);
  res.status(200).json({ message: 'Test dataset created successfully', vehiclesCreated: vehicles.length });

  } catch (error) {
    res.status(500).json({ message: 'Error creating test dataset', error: error.message });
  }
}