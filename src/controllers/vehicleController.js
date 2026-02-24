import axios from 'axios';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Vehicle from '../models/VehicleTwo.js';
import User from '../models/User.js';
import { authenticateUser } from '../helpers/authHelper.js';
import { getNewVehicleFullData, createVehicleREG, createVehicleVIN } from './vehicleHelpers.js';

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

    const vehicles = await Vehicle.find({ isDeleted: false }).sort({ createdAt: -1 });
    if (!vehicles) {
      return res.status(404).json({ message: 'No vehicles found' });
    };
    res.status(200).json({ message: 'Vehicles retrieved successfully', vehicles: vehicles });
  } catch (error) {
    console.error('Error getting vehicles:', error.message);
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

export const lookupVehicle = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { registration, vin } = req.query;
    if (!registration && !vin) {
      return res.status(400).json({ message: 'Vehicle registration or VIN is required' });
    }

    try {
      let vehicleData;
      if (registration) {
        vehicleData = await createVehicleREG(registration);
      } else if (vin) {
        vehicleData = await createVehicleVIN(vin);
      }
      
      res.status(200).json({ message: 'Vehicle lookup successful', data: vehicleData });
    } catch (error) {
      return res.status(400).json({ message: error.message || 'Vehicle not found in DVLA database' });
    }
  } catch (error) {
    handleError(res, error, 'Error looking up vehicle');
  }
};

export const addNewVehicle = async (req, res) => {
  try {
    const checkAuthenticatedUser = await authenticateUser(req, res);
    if (!checkAuthenticatedUser) return;

    const { vehicleDetails } = req.body;
    if (!vehicleDetails?.registration) {
      return res.status(404).json({ message: 'Vehicle registration not found in request payload' });
    }

    // Get full vehicle details and save to database
    return await getNewVehicleFullData(vehicleDetails.registration, res, vehicleDetails);
  } catch (error) {
    handleError(res, error, 'Error adding new vehicle');
  }
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
          engineCode: EngineNumber,
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

export const getVehiclesHTML = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ isDeleted: false }).sort({ createdAt: -1 });
    
    if (!vehicles || vehicles.length === 0) {
      return res.status(200).send(`
        <html>
          <head>
            <title>Vehicles List</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; background-color: #f5f5f5; }
              h1 { color: #333; }
              .message { color: #666; font-size: 16px; }
            </style>
          </head>
          <body>
            <h1>🚗 Vehicles Database</h1>
            <p class="message">No vehicles found in the database.</p>
          </body>
        </html>
      `);
    }

    const vehicleCards = vehicles.map((vehicle, index) => {
      // Helper to create collapsible sections
      const createCollapsibleSection = (title, sectionId, content) => {
        return `
          <div class="details-section collapsed" id="${sectionId}">
            <div class="section-header" onclick="toggleSection(this)">
              <h4>${title}</h4>
              <span class="section-toggle">▶</span>
            </div>
            <div class="section-content">
              ${content}
            </div>
          </div>
        `;
      };

      // Registration Details HTML
      const registrationContent = vehicle.VehicleRegistration ? `
        <div class="details-grid">
          ${vehicle.VehicleRegistration.Vrm ? `<p><strong>VRM:</strong> ${vehicle.VehicleRegistration.Vrm}</p>` : ''}
          <p><strong>VIN:</strong> HIDDEN</p>
          ${vehicle.VehicleRegistration.Make ? `<p><strong>Make:</strong> ${vehicle.VehicleRegistration.Make}</p>` : ''}
          ${vehicle.VehicleRegistration.Model ? `<p><strong>Model:</strong> ${vehicle.VehicleRegistration.Model}</p>` : ''}
          ${vehicle.VehicleRegistration.YearOfManufacture ? `<p><strong>Year:</strong> ${vehicle.VehicleRegistration.YearOfManufacture}</p>` : ''}
          ${vehicle.VehicleRegistration.Colour ? `<p><strong>Colour:</strong> ${vehicle.VehicleRegistration.Colour}</p>` : ''}
          ${vehicle.VehicleRegistration.FuelType ? `<p><strong>Fuel Type:</strong> ${vehicle.VehicleRegistration.FuelType}</p>` : ''}
          ${vehicle.VehicleRegistration.DateFirstRegisteredUk ? `<p><strong>First Registered (UK):</strong> ${new Date(vehicle.VehicleRegistration.DateFirstRegisteredUk).toLocaleDateString()}</p>` : ''}
          ${vehicle.VehicleRegistration.DoorPlanLiteral ? `<p><strong>Door Plan:</strong> ${vehicle.VehicleRegistration.DoorPlanLiteral}</p>` : ''}
          ${vehicle.VehicleRegistration.SeatingCapacity ? `<p><strong>Seating Capacity:</strong> ${vehicle.VehicleRegistration.SeatingCapacity}</p>` : ''}
          ${vehicle.VehicleRegistration.EngineCapacity ? `<p><strong>Engine Capacity:</strong> ${vehicle.VehicleRegistration.EngineCapacity}cc</p>` : ''}
          ${vehicle.VehicleRegistration.Transmission ? `<p><strong>Transmission:</strong> ${vehicle.VehicleRegistration.Transmission}</p>` : ''}
          ${vehicle.VehicleRegistration.Co2Emissions ? `<p><strong>CO2 Emissions:</strong> ${vehicle.VehicleRegistration.Co2Emissions}g/km</p>` : ''}
          ${vehicle.VehicleRegistration.GearCount ? `<p><strong>Gear Count:</strong> ${vehicle.VehicleRegistration.GearCount}</p>` : ''}
          ${vehicle.VehicleRegistration.MaxPermissibleMass ? `<p><strong>Max Permissible Mass:</strong> ${vehicle.VehicleRegistration.MaxPermissibleMass}kg</p>` : ''}
          ${vehicle.VehicleRegistration.WheelPlan ? `<p><strong>Wheel Plan:</strong> ${vehicle.VehicleRegistration.WheelPlan}</p>` : ''}
        </div>
      ` : '<p>No registration details available</p>';

      const registrationHTML = createCollapsibleSection('Vehicle Registration', `section-reg-${index}`, registrationContent);

      // Dimensions HTML
      const dimensionsContent = vehicle.Dimensions ? `
        <div class="details-grid">
          ${vehicle.Dimensions.CarLength ? `<p><strong>Length:</strong> ${vehicle.Dimensions.CarLength}mm</p>` : ''}
          ${vehicle.Dimensions.Width ? `<p><strong>Width:</strong> ${vehicle.Dimensions.Width}mm</p>` : ''}
          ${vehicle.Dimensions.Height ? `<p><strong>Height:</strong> ${vehicle.Dimensions.Height}mm</p>` : ''}
          ${vehicle.Dimensions.KerbWeight ? `<p><strong>Kerb Weight:</strong> ${vehicle.Dimensions.KerbWeight}kg</p>` : ''}
          ${vehicle.Dimensions.UnladenWeight ? `<p><strong>Unladen Weight:</strong> ${vehicle.Dimensions.UnladenWeight}kg</p>` : ''}
          ${vehicle.Dimensions.GrossVehicleWeight ? `<p><strong>Gross Vehicle Weight:</strong> ${vehicle.Dimensions.GrossVehicleWeight}kg</p>` : ''}
          ${vehicle.Dimensions.MaxPermissibleMass ? `<p><strong>Max Permissible Mass:</strong> ${vehicle.Dimensions.MaxPermissibleMass}kg</p>` : ''}
          ${vehicle.Dimensions.FuelTankCapacity ? `<p><strong>Fuel Tank Capacity:</strong> ${vehicle.Dimensions.FuelTankCapacity}L</p>` : ''}
          ${vehicle.Dimensions.NumberOfDoors ? `<p><strong>Number of Doors:</strong> ${vehicle.Dimensions.NumberOfDoors}</p>` : ''}
          ${vehicle.Dimensions.NumberOfSeats ? `<p><strong>Number of Seats:</strong> ${vehicle.Dimensions.NumberOfSeats}</p>` : ''}
          ${vehicle.Dimensions.WheelBase ? `<p><strong>Wheel Base:</strong> ${vehicle.Dimensions.WheelBase}mm</p>` : ''}
          ${vehicle.Dimensions.BodyShape ? `<p><strong>Body Shape:</strong> ${vehicle.Dimensions.BodyShape}</p>` : ''}
          ${vehicle.Dimensions.NumberOfAxles ? `<p><strong>Number of Axles:</strong> ${vehicle.Dimensions.NumberOfAxles}</p>` : ''}
        </div>
      ` : '<p>No dimensions available</p>';

      const dimensionsHTML = createCollapsibleSection('Dimensions & Weight', `section-dim-${index}`, dimensionsContent);

      // Engine HTML
      const engineContent = vehicle.Engine ? `
        <div class="details-grid">
          ${vehicle.Engine.Make ? `<p><strong>Engine Make:</strong> ${vehicle.Engine.Make}</p>` : ''}
          ${vehicle.Engine.NumberOfCylinders ? `<p><strong>Cylinders:</strong> ${vehicle.Engine.NumberOfCylinders}</p>` : ''}
          ${vehicle.Engine.Bore ? `<p><strong>Bore:</strong> ${vehicle.Engine.Bore}mm</p>` : ''}
          ${vehicle.Engine.Stroke ? `<p><strong>Stroke:</strong> ${vehicle.Engine.Stroke}mm</p>` : ''}
          ${vehicle.engineSize ? `<p><strong>Capacity:</strong> ${vehicle.engineSize}cc</p>` : ''}
          ${vehicle.Engine.ValvesPerCylinder ? `<p><strong>Valves Per Cylinder:</strong> ${vehicle.Engine.ValvesPerCylinder}</p>` : ''}
          ${vehicle.Engine.Aspiration ? `<p><strong>Aspiration:</strong> ${vehicle.Engine.Aspiration}</p>` : ''}
          ${vehicle.Engine.FuelDelivery ? `<p><strong>Fuel Delivery:</strong> ${vehicle.Engine.FuelDelivery}</p>` : ''}
          ${vehicle.Engine.ValveGear ? `<p><strong>Valve Gear:</strong> ${vehicle.Engine.ValveGear}</p>` : ''}
          ${vehicle.Engine.FuelSystem ? `<p><strong>Fuel System:</strong> ${vehicle.Engine.FuelSystem}</p>` : ''}
          ${vehicle.Engine.Location ? `<p><strong>Location:</strong> ${vehicle.Engine.Location}</p>` : ''}
          ${vehicle.Engine.CylinderArrangement ? `<p><strong>Cylinder Arrangement:</strong> ${vehicle.Engine.CylinderArrangement}</p>` : ''}
        </div>
      ` : '<p>No engine details available</p>';

      const engineHTML = createCollapsibleSection('Engine Details', `section-eng-${index}`, engineContent);

      // Performance HTML
      const performanceContent = vehicle.Performance ? `
        <div class="details-grid">
          ${vehicle.Performance.Power ? `<p><strong>Power:</strong> ${vehicle.Performance.Power.Bhp}bhp (${vehicle.Performance.Power.Kw}kW) @ ${vehicle.Performance.Power.Rpm}rpm</p>` : ''}
          ${vehicle.Performance.Torque ? `<p><strong>Torque:</strong> ${vehicle.Performance.Torque.Nm}Nm (${vehicle.Performance.Torque.FtLb}ft-lb) @ ${vehicle.Performance.Torque.Rpm}rpm</p>` : ''}
          ${vehicle.Performance.MaxSpeed ? `<p><strong>Max Speed:</strong> ${vehicle.Performance.MaxSpeed.Kph}kph (${vehicle.Performance.MaxSpeed.Mph}mph)</p>` : ''}
          ${vehicle.Performance.Acceleration ? `<p><strong>0-60 mph:</strong> ${vehicle.Performance.Acceleration.ZeroTo60Mph}s</p>` : ''}
          ${vehicle.Performance.Acceleration ? `<p><strong>0-100 kph:</strong> ${vehicle.Performance.Acceleration.ZeroTo100Kph}s</p>` : ''}
          ${vehicle.Performance.Co2 ? `<p><strong>CO2 Emissions:</strong> ${vehicle.Performance.Co2}g/km</p>` : ''}
        </div>
      ` : '<p>No performance data available</p>';

      const performanceHTML = createCollapsibleSection('Performance', `section-perf-${index}`, performanceContent);

      // Consumption HTML
      const consumptionContent = vehicle.Consumption ? `
        <div class="details-grid">
          ${vehicle.Consumption.Combined ? `<p><strong>Combined:</strong> ${vehicle.Consumption.Combined.Mpg}mpg (${vehicle.Consumption.Combined.Lkm}L/km)</p>` : ''}
          ${vehicle.Consumption.ExtraUrban ? `<p><strong>Extra Urban:</strong> ${vehicle.Consumption.ExtraUrban.Mpg}mpg (${vehicle.Consumption.ExtraUrban.Lkm}L/km)</p>` : ''}
          ${vehicle.Consumption.UrbanCold ? `<p><strong>Urban:</strong> ${vehicle.Consumption.UrbanCold.Mpg}mpg (${vehicle.Consumption.UrbanCold.Lkm}L/km)</p>` : ''}
        </div>
      ` : '<p>No consumption data available</p>';

      const consumptionHTML = createCollapsibleSection('Fuel Consumption', `section-cons-${index}`, consumptionContent);

      // SMMT Details HTML
      const smmtContent = vehicle.SmmtDetails ? `
        <div class="details-grid">
          ${vehicle.SmmtDetails.Marque ? `<p><strong>Marque:</strong> ${vehicle.SmmtDetails.Marque}</p>` : ''}
          ${vehicle.SmmtDetails.Series ? `<p><strong>Series:</strong> ${vehicle.SmmtDetails.Series}</p>` : ''}
          ${vehicle.SmmtDetails.ModelVariant ? `<p><strong>Model Variant:</strong> ${vehicle.SmmtDetails.ModelVariant}</p>` : ''}
          ${vehicle.SmmtDetails.BodyStyle ? `<p><strong>Body Style:</strong> ${vehicle.SmmtDetails.BodyStyle}</p>` : ''}
          ${vehicle.SmmtDetails.NumberOfDoors ? `<p><strong>Doors:</strong> ${vehicle.SmmtDetails.NumberOfDoors}</p>` : ''}
          ${vehicle.SmmtDetails.NumberOfGears ? `<p><strong>Gears:</strong> ${vehicle.SmmtDetails.NumberOfGears}</p>` : ''}
          ${vehicle.SmmtDetails.Transmission ? `<p><strong>Transmission:</strong> ${vehicle.SmmtDetails.Transmission}</p>` : ''}
          ${vehicle.SmmtDetails.FuelType ? `<p><strong>Fuel Type:</strong> ${vehicle.SmmtDetails.FuelType}</p>` : ''}
          ${vehicle.SmmtDetails.DriveType ? `<p><strong>Drive Type:</strong> ${vehicle.SmmtDetails.DriveType}</p>` : ''}
          ${vehicle.SmmtDetails.CountryOfOrigin ? `<p><strong>Country of Origin:</strong> ${vehicle.SmmtDetails.CountryOfOrigin}</p>` : ''}
          ${vehicle.SmmtDetails.Range ? `<p><strong>Range:</strong> ${vehicle.SmmtDetails.Range}</p>` : ''}
          ${vehicle.SmmtDetails.EngineCapacity ? `<p><strong>Engine Capacity:</strong> ${vehicle.SmmtDetails.EngineCapacity}</p>` : ''}
        </div>
      ` : '<p>No SMMT details available</p>';

      const smmtHTML = createCollapsibleSection('SMMT Details', `section-smmt-${index}`, smmtContent);

      // VED Rate HTML
      const vedContent = vehicle.vedRate ? `
        <div class="details-grid">
          ${vehicle.vedRate.vedBand ? `<p><strong>VED Band:</strong> ${vehicle.vedRate.vedBand}</p>` : ''}
          ${vehicle.vedRate.VedCo2Emissions ? `<p><strong>CO2 Emissions:</strong> ${vehicle.vedRate.VedCo2Emissions}g/km</p>` : ''}
          ${vehicle.vedRate.Standard ? `<p><strong>Standard 12-Month:</strong> £${vehicle.vedRate.Standard.TwelveMonth}</p>` : ''}
          ${vehicle.vedRate.Standard ? `<p><strong>Standard 6-Month:</strong> £${vehicle.vedRate.Standard.SixMonth}</p>` : ''}
        </div>
      ` : '<p>No VED data available</p>';

      const vedHTML = createCollapsibleSection('VED Rate & CO2', `section-ved-${index}`, vedContent);

      // General Info HTML
      const generalContent = vehicle.General ? `
        <div class="details-grid">
          ${vehicle.General.PowerDelivery ? `<p><strong>Power Delivery:</strong> ${vehicle.General.PowerDelivery}</p>` : ''}
          ${vehicle.General.EuroStatus ? `<p><strong>Euro Status:</strong> Euro ${vehicle.General.EuroStatus}</p>` : ''}
          ${vehicle.General.TypeApprovalCategory ? `<p><strong>Type Approval:</strong> ${vehicle.General.TypeApprovalCategory}</p>` : ''}
          ${vehicle.General.DriverPosition ? `<p><strong>Driver Position:</strong> ${vehicle.General.DriverPosition}</p>` : ''}
          ${vehicle.General.DrivingAxle ? `<p><strong>Driving Axle:</strong> ${vehicle.General.DrivingAxle}</p>` : ''}
          ${vehicle.General.SeriesDescription ? `<p><strong>Series Description:</strong> ${vehicle.General.SeriesDescription}</p>` : ''}
          ${vehicle.General.IsLimitedEdition !== undefined ? `<p><strong>Limited Edition:</strong> ${vehicle.General.IsLimitedEdition ? 'Yes' : 'No'}</p>` : ''}
        </div>
      ` : '<p>No general information available</p>';

      const generalHTML = createCollapsibleSection('General Information', `section-gen-${index}`, generalContent);

      // MOT Tests HTML
      const motTestsContent = vehicle.motTests && vehicle.motTests.length > 0 ? `
        <div class="mot-tests">
          ${vehicle.motTests.map((mot, motIndex) => `
            <div class="mot-test collapsed" id="mot-${index}-${motIndex}">
              <div class="mot-header" onclick="toggleMotTest(this)">
                <div style="flex: 1;">
                  <span><strong>Test Date:</strong> ${mot.completedDate ? new Date(mot.completedDate).toLocaleDateString() : 'N/A'}</span>
                  <span style="margin-left: 15px;"><strong>Result:</strong> <span class="result ${mot.testResult === 'PASSED' ? 'passed' : 'failed'}">${mot.testResult || 'N/A'}</span></span>
                </div>
                <span class="section-toggle" style="margin-left: 10px; color: #667eea;">▶</span>
              </div>
              <div class="mot-details-container">
                <div class="mot-details">
                  <p><strong>Test Number:</strong> ${mot.motTestNumber || 'N/A'}</p>
                  <p><strong>Expiry Date:</strong> ${mot.expiryDate ? new Date(mot.expiryDate).toLocaleDateString() : 'N/A'}</p>
                  <p><strong>Odometer:</strong> ${mot.odometerValue ? mot.odometerValue.toLocaleString() + ' ' + (mot.odometerUnit || 'KM') : 'N/A'}</p>
                  <p><strong>Odometer Result Type:</strong> ${mot.odometerResultType || 'N/A'}</p>
                  <p><strong>Location:</strong> ${mot.location || 'N/A'}</p>
                  <p><strong>Data Source:</strong> ${mot.dataSource || 'N/A'}</p>
                  ${mot.defects && mot.defects.length > 0 ? `
                    <div class="defects">
                      <strong>Defects (${mot.defects.length}):</strong>
                      <ul>
                        ${mot.defects.map(defect => `
                          <li class="defect-${defect.type}">
                            <strong>${defect.type}</strong>: ${defect.text}
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                  ` : '<p><strong>✓ No defects found</strong></p>'}
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      ` : '<p>No MOT test records available</p>';

      const motTestsHTML = createCollapsibleSection(`MOT Tests (${vehicle.motTests?.length || 0})`, `section-mot-${index}`, motTestsContent);

      // Vehicle History HTML
      const vehicleHistoryContent = vehicle.VehicleHistory ? `
        <div class="details-grid">
          ${vehicle.VehicleHistory.NumberOfPreviousKeepers !== undefined ? `<p><strong>Previous Keepers:</strong> ${vehicle.VehicleHistory.NumberOfPreviousKeepers}</p>` : ''}
          ${vehicle.VehicleHistory.V5CCertificateCount !== undefined ? `<p><strong>V5C Certificates:</strong> ${vehicle.VehicleHistory.V5CCertificateCount}</p>` : ''}
          ${vehicle.VehicleHistory.PlateChangeCount !== undefined ? `<p><strong>Plate Changes:</strong> ${vehicle.VehicleHistory.PlateChangeCount}</p>` : ''}
          ${vehicle.VehicleHistory.ColourChangeCount !== undefined ? `<p><strong>Colour Changes:</strong> ${vehicle.VehicleHistory.ColourChangeCount}</p>` : ''}
          ${vehicle.VehicleHistory.VicCount !== undefined ? `<p><strong>VIC Count:</strong> ${vehicle.VehicleHistory.VicCount}</p>` : ''}
          ${vehicle.VehicleHistory.ColourChangeDetails?.CurrentColour ? `<p><strong>Current Colour:</strong> ${vehicle.VehicleHistory.ColourChangeDetails.CurrentColour}</p>` : ''}
          ${vehicle.VehicleHistory.ColourChangeDetails?.OriginalColour ? `<p><strong>Original Colour:</strong> ${vehicle.VehicleHistory.ColourChangeDetails.OriginalColour}</p>` : ''}
          ${vehicle.VehicleHistory.ColourChangeDetails?.DateOfLastColourChange ? `<p><strong>Last Colour Change:</strong> ${new Date(vehicle.VehicleHistory.ColourChangeDetails.DateOfLastColourChange).toLocaleDateString()}</p>` : ''}
        </div>
      ` : '<p>No vehicle history available</p>';

      const vehicleHistoryHTML = createCollapsibleSection('Vehicle History', `section-hist-${index}`, vehicleHistoryContent);

      return `
        <div class="vehicle-card">
          <div class="vehicle-header" onclick="toggleVehicle('vehicle-${index}')">
            <div class="vehicle-summary">
              <div class="vehicle-title">
                <h3>${vehicle.make || 'Unknown'} ${vehicle.model || ''} <span class="registration">${vehicle.registration || 'N/A'}</span></h3>
                <p class="vehicle-meta">${vehicle.fuelType || 'N/A'} • ${vehicle.primaryColour || 'N/A'} • ${vehicle.General && vehicle.General.EuroStatus ? 'Euro ' + vehicle.General.EuroStatus : 'N/A'}</p>
              </div>
            </div>
            <div class="toggle-icon">▼</div>
          </div>
          
          <div class="vehicle-details" id="vehicle-${index}">
            <div class="details-container">
              ${registrationHTML}
              ${dimensionsHTML}
              ${engineHTML}
              ${performanceHTML}
              ${consumptionHTML}
              ${smmtHTML}
              ${vedHTML}
              ${generalHTML}
              ${vehicleHistoryHTML}
              ${motTestsHTML}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Vehicles Database</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: white;
              min-height: 100vh;
              padding: 20px;
            }

            .container {
              max-width: 1000px;
              margin: 0 auto;
            }

            h1 {
              display: none;
            }

            .count {
              color: #333;
              text-align: center;
              margin-bottom: 30px;
              font-size: 16px;
            }

            .vehicle-card {
              background: white;
              border-radius: 8px;
              margin-bottom: 15px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
              overflow: hidden;
            }

            .vehicle-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 20px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .vehicle-header:hover {
              background: linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%);
            }

            .vehicle-summary {
              flex: 1;
            }

            .vehicle-title h3 {
              font-size: 20px;
              margin-bottom: 5px;
              display: flex;
              gap: 10px;
              align-items: center;
            }

            .registration {
              background: rgba(255, 255, 255, 0.2);
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: 600;
            }

            .vehicle-meta {
              font-size: 14px;
              opacity: 0.9;
            }

            .toggle-icon {
              font-size: 20px;
              transition: transform 0.3s ease;
              margin-left: 20px;
            }

            .vehicle-card.expanded .toggle-icon {
              transform: rotate(180deg);
            }

            .vehicle-details {
              max-height: 0;
              overflow: hidden;
              transition: max-height 0.3s ease;
            }

            .vehicle-card.expanded .vehicle-details {
              max-height: 10000px;
            }

            .details-container {
              padding: 20px;
              background: #f8f9ff;
            }

            .details-section {
              margin-bottom: 15px;
              border: 1px solid #e0e0e0;
              border-radius: 6px;
              overflow: hidden;
              background: white;
            }

            .details-section:last-child {
              margin-bottom: 0;
            }

            .section-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 15px;
              background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
              cursor: pointer;
              user-select: none;
              border-bottom: 1px solid #e0e0e0;
              transition: background 0.2s ease;
            }

            .section-header:hover {
              background: linear-gradient(135deg, #eff2f7 0%, #e0e5ef 100%);
            }

            .section-header h4 {
              color: #667eea;
              margin: 0;
              font-size: 15px;
              font-weight: 600;
              flex: 1;
            }

            .section-toggle {
              display: flex;
              align-items: center;
              margin-left: 10px;
              color: #667eea;
              font-size: 18px;
              transition: transform 0.2s ease;
            }

            .details-section.collapsed .section-toggle {
              transform: rotate(-90deg);
            }

            .section-content {
              max-height: 10000px;
              overflow: hidden;
              transition: max-height 0.3s ease, padding 0.3s ease;
              padding: 15px;
            }

            .details-section.collapsed .section-content {
              max-height: 0;
              padding: 0 15px;
            }

            .details-section h4 {
              margin: 0;
            }

            .details-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 15px;
            }

            .details-grid p {
              color: #333;
              font-size: 14px;
              line-height: 1.6;
              margin: 0;
            }

            .details-grid strong {
              color: #667eea;
              display: block;
              margin-bottom: 3px;
            }

            .mot-tests {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .mot-test {
              background: white;
              border: 1px solid #e0e0e0;
              border-radius: 4px;
              overflow: hidden;
            }

            .mot-test.collapsed .mot-details-container {
              max-height: 0;
              overflow: hidden;
              transition: max-height 0.3s ease;
            }

            .mot-test:not(.collapsed) .mot-details-container {
              max-height: 10000px;
              overflow: hidden;
              transition: max-height 0.3s ease;
            }

            .mot-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 15px;
              background: linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%);
              cursor: pointer;
              user-select: none;
              border-left: 4px solid #667eea;
              transition: background 0.2s ease;
            }

            .mot-header:hover {
              background: linear-gradient(135deg, #eff2f7 0%, #e0e5ef 100%);
            }

            .mot-header span {
              font-size: 13px;
              color: #333;
            }

            .mot-details-container {
              padding: 12px 15px;
              background: #f8f9ff;
            }

            .mot-details {
              font-size: 13px;
              color: #555;
            }

            .mot-details p {
              margin: 8px 0;
              line-height: 1.5;
            }

            .result {
              padding: 4px 12px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 12px;
              display: inline-block;
            }

            .result.passed {
              background: #4caf50;
              color: white;
            }

            .result.failed {
              background: #f44336;
              color: white;
            }

            .defects {
              margin-top: 10px;
              padding-top: 10px;
              border-top: 1px solid #e0e0e0;
            }

            .defects ul {
              list-style: none;
              margin-top: 8px;
              padding-left: 0;
            }

            .defects li {
              padding: 6px 8px;
              margin: 4px 0;
              border-radius: 4px;
              font-size: 12px;
              border-left: 3px solid #999;
              line-height: 1.4;
            }

            .defect-DANGEROUS {
              background: #ffebee;
              border-left-color: #f44336;
              color: #c62828;
            }

            .defect-PRS {
              background: #fff3e0;
              border-left-color: #ff9800;
              color: #e65100;
            }

            .defect-ADVISORY {
              background: #e3f2fd;
              border-left-color: #2196f3;
              color: #1565c0;
            }

            /* Mobile Responsive */
            @media (max-width: 768px) {
              h1 {
                font-size: 24px;
              }

              .vehicle-header {
                padding: 15px;
              }

              .vehicle-title h3 {
                font-size: 16px;
              }

              .registration {
                font-size: 12px;
                padding: 3px 8px;
              }

              .vehicle-meta {
                font-size: 12px;
              }

              .details-grid {
                grid-template-columns: 1fr;
              }

              .details-container {
                padding: 15px;
              }

              .details-section {
                margin-bottom: 12px;
              }

              .section-header {
                padding: 10px 12px;
              }

              .section-header h4 {
                font-size: 14px;
              }

              .section-content {
                padding: 12px;
              }

              .mot-header {
                flex-direction: column;
                align-items: flex-start;
              }

              .toggle-icon {
                margin-left: 10px;
              }
            }

            @media (max-width: 480px) {
              body {
                padding: 10px;
              }

              h1 {
                font-size: 20px;
              }

              .vehicle-header {
                padding: 12px;
              }

              .vehicle-title h3 {
                font-size: 14px;
              }

              .vehicle-details {
                max-height: 20000px;
              }

              .section-header h4 {
                font-size: 13px;
              }

              .section-toggle {
                font-size: 16px;
              }

              .mot-test {
                padding: 10px;
              }

              .details-grid p {
                font-size: 13px;
              }

              .details-grid strong {
                font-size: 12px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚗 Vehicles Database</h1>
            <p class="count">Total Vehicles: <strong>${vehicles.length}</strong></p>
            <div class="vehicles-list">
              ${vehicleCards}
            </div>
          </div>

          <script>
            function toggleVehicle(vehicleId) {
              const card = document.getElementById(vehicleId).parentElement;
              card.classList.toggle('expanded');
            }

            function toggleSection(headerElement) {
              const section = headerElement.closest('.details-section');
              section.classList.toggle('collapsed');
            }

            function toggleMotTest(headerElement) {
              const motTest = headerElement.closest('.mot-test');
              motTest.classList.toggle('collapsed');
              
              // Rotate the arrow
              const toggle = headerElement.querySelector('.section-toggle');
              if (toggle) {
                if (motTest.classList.contains('collapsed')) {
                  toggle.textContent = '▶';
                } else {
                  toggle.textContent = '▼';
                }
              }
            }
          </script>
        </body>
      </html>
    `;

    res.status(200).send(html);
  } catch (error) {
    console.error('Error getting vehicles HTML:', error.message);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Error</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 0; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .error-container {
              background-color: white;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
              max-width: 600px;
              text-align: center;
            }
            h1 { color: #d32f2f; margin-bottom: 15px; }
            p { color: #666; font-size: 16px; }
          </style>
        </head>
        <body>
          <div class="error-container">
            <h1>⚠️ Error Loading Vehicles</h1>
            <p>${error.message}</p>
          </div>
        </body>
      </html>
    `);
  }
};
