import mongoose from "mongoose";

// Vehicle Registration sub-schema
const vehicleRegistrationSchema = new mongoose.Schema({
  DateOfLastUpdate: { type: Date, required: false },
  Colour: { type: String, required: false },
  VehicleClass: { type: String, required: false },
  CertificateOfDestructionIssued: { type: Boolean, required: false },
  EngineNumber: { type: String, required: false },
  EngineCapacity: { type: String, required: false },
  TransmissionCode: { type: String, required: false },
  Exported: { type: Boolean, required: false },
  YearOfManufacture: { type: String, required: false },
  WheelPlan: { type: String, required: false },
  DateExported: { type: Date, required: false },
  Scrapped: { type: Boolean, required: false },
  Transmission: { type: String, required: false },
  DateFirstRegisteredUk: { type: Date, required: false },
  Model: { type: String, required: false },
  GearCount: { type: Number, required: false },
  ImportNonEu: { type: Boolean, required: false },
  PreviousVrmGb: { type: String, required: false },
  GrossWeight: { type: Number, required: false },
  DoorPlanLiteral: { type: String, required: false },
  MvrisModelCode: { type: String, required: false },
  Vin: { type: String, required: false },
  Vrm: { type: String, required: false },
  DateFirstRegistered: { type: Date, required: false },
  DateScrapped: { type: Date, required: false },
  DoorPlan: { type: String, required: false },
  YearMonthFirstRegistered: { type: String, required: false },
  VinLast5: { type: String, required: false },
  VehicleUsedBeforeFirstRegistration: { type: Boolean, required: false },
  MaxPermissibleMass: { type: Number, required: false },
  Make: { type: String, required: false },
  MakeModel: { type: String, required: false },
  TransmissionType: { type: String, required: false },
  SeatingCapacity: { type: Number, required: false },
  FuelType: { type: String, required: false },
  Co2Emissions: { type: Number, required: false },
  Imported: { type: Boolean, required: false },
  MvrisMakeCode: { type: String, required: false },
  PreviousVrmNi: { type: String, required: false },
  VinConfirmationFlag: { type: String, required: false }
}, { _id: false });

// Dimensions sub-schema
const dimensionsSchema = new mongoose.Schema({
  UnladenWeight: { type: Number, required: false },
  RigidArtic: { type: String, required: false },
  BodyShape: { type: String, required: false },
  PayloadVolume: { type: Number, required: false },
  PayloadWeight: { type: Number, required: false },
  Height: { type: Number, required: false },
  NumberOfDoors: { type: Number, required: false },
  NumberOfSeats: { type: Number, required: false },
  KerbWeight: { type: Number, required: false },
  GrossTrainWeight: { type: Number, required: false },
  FuelTankCapacity: { type: Number, required: false },
  LoadLength: { type: Number, required: false },
  DataVersionNumber: { type: String, required: false },
  WheelBase: { type: Number, required: false },
  CarLength: { type: Number, required: false },
  Width: { type: Number, required: false },
  NumberOfAxles: { type: Number, required: false },
  GrossVehicleWeight: { type: Number, required: false },
  GrossCombinedWeight: { type: Number, required: false }
}, { _id: false });

// Engine sub-schema
const engineSchema = new mongoose.Schema({
  FuelCatalyst: { type: String, required: false },
  Stroke: { type: Number, required: false },
  PrimaryFuelFlag: { type: String, required: false },
  ValvesPerCylinder: { type: Number, required: false },
  Aspiration: { type: String, required: false },
  FuelSystem: { type: String, required: false },
  NumberOfCylinders: { type: Number, required: false },
  CylinderArrangement: { type: String, required: false },
  ValveGear: { type: String, required: false },
  Location: { type: String, required: false },
  Description: { type: String, required: false },
  Bore: { type: Number, required: false },
  Make: { type: String, required: false },
  FuelDelivery: { type: String, required: false }
}, { _id: false });

// Torque sub-schema
const torqueSchema = new mongoose.Schema({
  FtLb: { type: Number, required: false },
  Nm: { type: Number, required: false },
  Rpm: { type: Number, required: false }
}, { _id: false });

// Power sub-schema
const powerSchema = new mongoose.Schema({
  Bhp: { type: Number, required: false },
  Rpm: { type: Number, required: false },
  Kw: { type: Number, required: false }
}, { _id: false });

// MaxSpeed sub-schema
const maxSpeedSchema = new mongoose.Schema({
  Kph: { type: Number, required: false },
  Mph: { type: Number, required: false }
}, { _id: false });

// Acceleration sub-schema
const accelerationSchema = new mongoose.Schema({
  Mph: { type: Number, required: false },
  Kph: { type: Number, required: false },
  ZeroTo60Mph: { type: Number, required: false },
  ZeroTo100Kph: { type: Number, required: false }
}, { _id: false });

// Performance sub-schema
const performanceSchema = new mongoose.Schema({
  Torque: { type: torqueSchema, required: false },
  NoiseLevel: { type: Number, required: false },
  DataVersionNumber: { type: String, required: false },
  Power: { type: powerSchema, required: false },
  MaxSpeed: { type: maxSpeedSchema, required: false },
  Co2: { type: Number, required: false },
  Particles: { type: Number, required: false },
  Acceleration: { type: accelerationSchema, required: false }
}, { _id: false });

// Consumption sub-schema
const consumptionItemSchema = new mongoose.Schema({
  Lkm: { type: Number, required: false },
  Mpg: { type: Number, required: false }
}, { _id: false });

const consumptionSchema = new mongoose.Schema({
  ExtraUrban: { type: consumptionItemSchema, required: false },
  UrbanCold: { type: consumptionItemSchema, required: false },
  Combined: { type: consumptionItemSchema, required: false }
}, { _id: false });

// SMMT Details sub-schema
const smmtDetailsSchema = new mongoose.Schema({
  Range: { type: String, required: false },
  FuelType: { type: String, required: false },
  EngineCapacity: { type: String, required: false },
  MarketSectorCode: { type: String, required: false },
  CountryOfOrigin: { type: String, required: false },
  ModelCode: { type: String, required: false },
  ModelVariant: { type: String, required: false },
  DataVersionNumber: { type: String, required: false },
  NumberOfGears: { type: Number, required: false },
  NominalEngineCapacity: { type: Number, required: false },
  MarqueCode: { type: String, required: false },
  Transmission: { type: String, required: false },
  BodyStyle: { type: String, required: false },
  VisibilityDate: { type: String, required: false },
  SysSetupDate: { type: String, required: false },
  Marque: { type: String, required: false },
  CabType: { type: String, required: false },
  TerminateDate: { type: Date, required: false },
  Series: { type: String, required: false },
  NumberOfDoors: { type: Number, required: false },
  DriveType: { type: String, required: false }
}, { _id: false });

// VED Standard sub-schema
const vedStandardSchema = new mongoose.Schema({
  SixMonth: { type: Number, required: false },
  TwelveMonth: { type: Number, required: false }
}, { _id: false });

// VED Rate sub-schema
const vedRateSchema = new mongoose.Schema({
  Standard: { type: vedStandardSchema, required: false },
  VedCo2Emissions: { type: Number, required: false },
  vedBand: { type: String, required: false },
  VedCo2Band: { type: String, required: false }
}, { _id: false });

// General sub-schema
const generalSchema = new mongoose.Schema({
  PowerDelivery: { type: String, required: false },
  TypeApprovalCategory: { type: String, required: false },
  SeriesDescription: { type: String, required: false },
  DriverPosition: { type: String, required: false },
  DrivingAxle: { type: String, required: false },
  DataVersionNumber: { type: String, required: false },
  EuroStatus: { type: String, required: false },
  IsLimitedEdition: { type: Boolean, required: false }
}, { _id: false });

// Main VehicleTwo schema
const vehicleTwoSchema = new mongoose.Schema({
  VehicleRegistration: { type: vehicleRegistrationSchema, required: false },
  Dimensions: { type: dimensionsSchema, required: false },
  Engine: { type: engineSchema, required: false },
  Performance: { type: performanceSchema, required: false },
  Consumption: { type: consumptionSchema, required: false },
  SmmtDetails: { type: smmtDetailsSchema, required: false },
  vedRate: { type: vedRateSchema, required: false },
  General: { type: generalSchema, required: false },
  isDeleted: { type: Boolean, required: false, default: false },
  dateDeleted: { type: Date, required: false },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
}, { timestamps: true });

// Export the VehicleTwo model based on the schema.
export default mongoose.model("VehicleTwo", vehicleTwoSchema);
