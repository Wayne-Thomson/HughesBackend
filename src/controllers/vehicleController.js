import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from '../models/VehicleTwo.js';
import User from '../models/User.js';
import { authenticateUser } from '../helpers/authHelper.js';
// import VehicleTwo from '../models/VehicleTwo.js';

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
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    // await deleteAllVehicles(req, res); // Call the function to delete all vehicles and return the response

    // return await newCreateTestDataSet(req, res); // Call the new function to create the test dataset and return the response

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
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const vehicles = await Vehicle.find({ isDeleted: true }).sort({ dateDeleted: -1 });
    res.status(200).json({ message: 'Vehicles retrieved successfully', vehicles: vehicles });
  } catch (error) {
    handleError(res, error, 'Error getting deleted vehicles');
  };
};

export const getVehicle = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

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

export const addNewVehicle = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { registration, vin } = req.body;
    if (!registration && !vin) {
      return res.status(400).json({ message: 'Vehicle registration or VIN is required' });
    }

    let newVehicle;
    if (registration) {
      newVehicle = await createVehicleREG(registration, res);
    } else if (vin) {
      newVehicle = await createVehicleVIN(vin, res);
    }

    res.status(200).json({ message: 'Vehicle created successfully', newVehicle: newVehicle });
  } catch (error) {
    handleError(res, error, 'Error adding new vehicle');
  }
};

const createVehicleREG = async (registration, res) => {
  try {
    // DVLA API integration using the registration number provided in the request body
    const registrationNumber = registration;
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
    console.log('DVLA API response data:', data);
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

    return newVehicle;
  } catch (error) {
    throw error; // Let the calling function handle the error and response
  };
};

const createVehicleVIN = async (vin, res) => {
  try {
    // DVLA API integration using the registration number provided in the request body
    const VIN = vin;
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

    console.log('DVLA API response data:', data);
    // console.log('Creating new vehicle with registration number:', data.registration);
    
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

    return newVehicle;
  } catch (error) {
    throw error; // Let the calling function handle the error and response
  };
};

export const updateAVehicle = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    console.log('Received request to update vehicle with ID:', req?.params?.id, 'and body:', req?.body);
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
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

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
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

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
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

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
};

const newCreateTestDataSet = async (req, res) => {
  try {
    // const checkAuthenticatedUser = await authenticateUser(req, res, true);
    // if (!checkAuthenticatedUser) return;

    function generateVehicles(count = 1000) {

  const makes = {
    MINI: {
      models: ["COOPER", "COOPER S", "ONE", "COUNTRYMAN", "CLUBMAN"],
      series: ["R50", "R53", "R56", "F55", "F56", "F60"],
      origin: "UNITED KINGDOM"
    },
    FORD: {
      models: ["FIESTA", "FOCUS", "KUGA", "MONDEO", "PUMA"],
      series: ["MK6", "MK7", "MK8", "MK9"],
      origin: "UNITED KINGDOM"
    },
    BMW: {
      models: ["1 SERIES", "3 SERIES", "5 SERIES", "X1", "X3", "X5"],
      series: ["E87", "F20", "G20", "F30", "G30"],
      origin: "GERMANY"
    },
    AUDI: {
      models: ["A1", "A3", "A4", "A6", "Q2", "Q3", "Q5"],
      series: ["8P", "8V", "B8", "B9", "C7"],
      origin: "GERMANY"
    },
    VOLKSWAGEN: {
      models: ["POLO", "GOLF", "PASSAT", "TIGUAN", "T-ROC"],
      series: ["MK5", "MK6", "MK7", "MK8"],
      origin: "GERMANY"
    },
    MERCEDES: {
      models: ["A CLASS", "C CLASS", "E CLASS", "GLA", "GLC"],
      series: ["W176", "W205", "W213"],
      origin: "GERMANY"
    },
    TOYOTA: {
      models: ["YARIS", "COROLLA", "PRIUS", "RAV4", "C-HR"],
      series: ["XP130", "E210", "XA50"],
      origin: "JAPAN"
    },
    NISSAN: {
      models: ["MICRA", "QASHQAI", "JUKE", "X-TRAIL", "LEAF"],
      series: ["K12", "J10", "J11", "ZE1"],
      origin: "JAPAN"
    },
    HYUNDAI: {
      models: ["I10", "I20", "I30", "TUCSON", "KONA"],
      series: ["MK1", "MK2", "MK3"],
      origin: "SOUTH KOREA"
    },
    KIA: {
      models: ["PICANTO", "RIO", "CEED", "SPORTAGE", "NIRO"],
      series: ["MK1", "MK2", "MK3", "MK4"],
      origin: "SOUTH KOREA"
    },
    PEUGEOT: {
      models: ["108", "208", "308", "2008", "3008", "5008"],
      series: ["MK1", "MK2"],
      origin: "FRANCE"
    },
    SKODA: {
      models: ["FABIA", "OCTAVIA", "SUPERB", "KAMIQ", "KODIAQ"],
      series: ["MK1", "MK2", "MK3", "MK4"],
      origin: "CZECH REPUBLIC"
    },
    SEAT: {
      models: ["IBIZA", "LEON", "ARONA", "ATECA"],
      series: ["MK3", "MK4"],
      origin: "SPAIN"
    },
    VOLVO: {
      models: ["V40", "V60", "XC40", "XC60", "XC90"],
      series: ["P1", "SPA"],
      origin: "SWEDEN"
    },
    TESLA: {
      models: ["MODEL 3", "MODEL S", "MODEL Y"],
      series: ["PRE-FACELIFT", "FACELIFT"],
      origin: "UNITED STATES"
    }
  };

      const colours = ["BLACK", "WHITE", "GREY", "BLUE", "RED", "SILVER"];
      const fuels = ["PETROL", "DIESEL", "HYBRID ELECTRIC"];
      const letters = "ABCDEFGHJKLMNPRSTUVWXYZ";
      const numbers = "0123456789";

      const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
      const randNum = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

      const generateUKPlate = (date) => {
        const year = date.getFullYear().toString().slice(-2);
        const month = date.getMonth() + 1;
        const ageId = month >= 3 && month < 9 ? year : (parseInt(year) + 50).toString();

        const randLetter = () => letters[Math.floor(Math.random() * letters.length)];

        return (
          randLetter() +
          randLetter() +
          ageId.padStart(2, "0") +
          " " +
          randLetter() +
          randLetter() +
          randLetter()
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

      const vehicles = [];
      const seen = new Set();

      while (vehicles.length < count) {

        const year = randNum(2006, 2023);
        const firstReg = new Date(year, randNum(0, 11), randNum(1, 28));
        const vrm = generateUKPlate(firstReg);
        if (seen.has(vrm)) continue;
        seen.add(vrm);

        const makeKey = rand(Object.keys(makes));
        const makeData = makes[makeKey];
        const model = rand(makeData.models);
        const series = rand(makeData.series);

        const vin = randomVIN();
        const fuelType = rand(fuels);
        const engineCapacity = randNum(1000, 3000);
        const cylinders = engineCapacity > 2000 ? 6 : 4;

        const bhp = randNum(100, 300);
        const torqueNm = Math.round(bhp * 1.4);
        const co2 = fuelType === "HYBRID ELECTRIC" ? randNum(70,120) : randNum(110, 220);

        const zeroTo60 = parseFloat((8 - (bhp - 100) / 50).toFixed(1));
        const mpgCombined = fuelType === "DIESEL" ? randNum(50,70)
                            : fuelType === "HYBRID ELECTRIC" ? randNum(55,80)
                            : randNum(30,45);

        const vedBand = co2 < 100 ? "A" :
                        co2 < 110 ? "B" :
                        co2 < 130 ? "C" :
                        co2 < 150 ? "D" :
                        co2 < 170 ? "E" :
                        co2 < 190 ? "F" : "G";

        const euroStatus = year < 2011 ? "4" : year < 2015 ? "5" : "6";

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

        let colour = rand(colours);

        const isDeleted = Math.random() < 0.03;
        const dateDeleted = isDeleted ? randomDateBetween(2022) : null;
        const EngineNumber = `ENG${randNum(10000,99999)}`;

        const vehicle = {
          registration: vrm, 
          vin: vin,
          make: makeKey,
          model: model,
          country: makeData.origin,
          generation: series,
          motTests: generateMotTests(firstReg),
          registrationDate: firstReg,
          firstUsedDate: firstReg,
          fuelType: fuelType,
          primaryColour: colour,
          registrationDate: firstReg,
          manufactureDate: year.toString(),
          engineSize: engineCapacity.toString(),
          isDeleted,
          dateDeleted,
          EngineCode: EngineNumber,
          VehicleRegistration: {
            DateOfLastUpdate: new Date(),
            Colour: colour,
            VehicleClass: "Car",
            CertificateOfDestructionIssued: false,
            EngineNumber: EngineNumber,
            EngineCapacity: engineCapacity.toString(),
            TransmissionCode: "A",
            Exported: false,
            YearOfManufacture: year.toString(),
            WheelPlan: "2 AXLE RIGID BODY",
            DateExported: null,
            Scrapped: false,
            Transmission: "AUTO 6 GEARS",
            DateFirstRegisteredUk: firstReg,
            Model: model,
            GearCount: 6,
            ImportNonEu: false,
            PreviousVrmGb: null,
            GrossWeight: randNum(1500, 2500),
            DoorPlanLiteral: "5 DOOR HATCHBACK",
            MvrisModelCode: "ACN",
            Vin: vin,
            Vrm: vrm,
            DateFirstRegistered: firstReg,
            DateScrapped: null,
            DoorPlan: "13",
            YearMonthFirstRegistered: `${year}-${String(firstReg.getMonth()+1).padStart(2,'0')}`,
            VinLast5: vin.slice(-5),
            VehicleUsedBeforeFirstRegistration: false,
            MaxPermissibleMass: randNum(1500, 2500),
            Make: makeKey,
            MakeModel: `${makeKey} ${model}`,
            TransmissionType: "Automatic",
            SeatingCapacity: 5,
            FuelType: fuelType,
            Co2Emissions: co2,
            Imported: false,
            MvrisMakeCode: "C1",
            PreviousVrmNi: null,
            VinConfirmationFlag: null
          },

          Dimensions: {
            UnladenWeight: randNum(1100, 1900),
            RigidArtic: "RIGID",
            BodyShape: "Hatchback",
            PayloadVolume: null,
            PayloadWeight: null,
            Height: randNum(1400, 1700),
            NumberOfDoors: 5,
            NumberOfSeats: 5,
            KerbWeight: randNum(1100, 1900),
            GrossTrainWeight: null,
            FuelTankCapacity: fuelType === "HYBRID ELECTRIC" ? 40 : 50,
            LoadLength: null,
            DataVersionNumber: null,
            WheelBase: randNum(2500, 2800),
            CarLength: randNum(3800, 4700),
            Width: randNum(1700, 1900),
            NumberOfAxles: 2,
            GrossVehicleWeight: randNum(1600, 2600),
            GrossCombinedWeight: null
          },

          Engine: {
            FuelCatalyst: "C",
            Stroke: randNum(75, 95),
            PrimaryFuelFlag: "Y",
            ValvesPerCylinder: 4,
            Aspiration: bhp > 180 ? "Turbocharged" : "Naturally Aspirated",
            FuelSystem: `Euro ${euroStatus}`,
            NumberOfCylinders: cylinders,
            CylinderArrangement: "I",
            ValveGear: "DOHC",
            Location: "FRONT",
            Description: null,
            Bore: randNum(70, 90),
            Make: makeKey,
            FuelDelivery: "Direct Injection"
          },

          Performance: {
            Torque: {
              FtLb: parseFloat((torqueNm * 0.737).toFixed(1)),
              Nm: torqueNm,
              Rpm: randNum(1500, 4000)
            },
            NoiseLevel: null,
            DataVersionNumber: null,
            Power: {
              Bhp: bhp,
              Rpm: randNum(4000, 6500),
              Kw: Math.round(bhp * 0.7457)
            },
            MaxSpeed: {
              Kph: randNum(180, 260),
              Mph: randNum(110, 160)
            },
            Co2: co2,
            Particles: null,
            Acceleration: {
              Mph: zeroTo60,
              Kph: parseFloat((zeroTo60 * 1.05).toFixed(1)),
              ZeroTo60Mph: zeroTo60,
              ZeroTo100Kph: parseFloat((zeroTo60 * 1.05).toFixed(1))
            }
          },

          Consumption: {
            ExtraUrban: {
              Lkm: parseFloat((235.2 / mpgCombined * 0.9).toFixed(1)),
              Mpg: mpgCombined + 5
            },
            UrbanCold: {
              Lkm: parseFloat((235.2 / mpgCombined * 1.2).toFixed(1)),
              Mpg: mpgCombined - 5
            },
            Combined: {
              Lkm: parseFloat((235.2 / mpgCombined).toFixed(1)),
              Mpg: mpgCombined
            }
          },

          SmmtDetails: {
            Range: "HATCH",
            FuelType: fuelType,
            EngineCapacity: engineCapacity.toString(),
            MarketSectorCode: "AA",
            CountryOfOrigin: makeData.origin,
            ModelCode: randNum(100,999).toString(),
            ModelVariant: model,
            DataVersionNumber: null,
            NumberOfGears: 6,
            NominalEngineCapacity: parseFloat((engineCapacity/1000).toFixed(1)),
            MarqueCode: "BB",
            Transmission: "AUTOMATIC",
            BodyStyle: "Hatchback",
            VisibilityDate: `01/03/${year}`,
            SysSetupDate: `01/03/${year}`,
            Marque: makeKey,
            CabType: "NA",
            TerminateDate: null,
            Series: series,
            NumberOfDoors: 5,
            DriveType: rand(["4X2","AWD"])
          },

          vedRate: {
            Standard: {
              SixMonth: randNum(80, 200),
              TwelveMonth: randNum(150, 400)
            },
            VedCo2Emissions: co2,
            vedBand: vedBand,
            VedCo2Band: vedBand
          },

          General: {
            PowerDelivery: bhp > 220 ? "SPORT" : "NORMAL",
            TypeApprovalCategory: "M1",
            SeriesDescription: `${series} ${year < 2012 ? "PRE-FACELIFT" : "FACELIFT"}`,
            DriverPosition: "R",
            DrivingAxle: rand(["FWD","RWD","AWD"]),
            DataVersionNumber: null,
            EuroStatus: euroStatus,
            IsLimitedEdition: Math.random() < 0.1
          }
        };

        vehicles.push(vehicle);
      }

      return vehicles;
    }

    const vehicles = generateVehicles(1000);
    await Vehicle.insertMany(vehicles);

    res.status(200).json({
      message: "Full realistic UK dataset created successfully",
      vehiclesCreated: vehicles.length
    });

  } catch (error) {
    console.error("Error creating test dataset:", error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

const deleteAllVehicles = async (req, res) => {
  try {

    const result = await Vehicle.deleteMany({});

    res.status(200).json({
      message: "All vehicle records deleted successfully",
      deletedCount: result.deletedCount
    });

  } catch (error) {
    res.status(500).json({
      message: "Error deleting vehicle records",
      error: error.message
    });
  }
};
