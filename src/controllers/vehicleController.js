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
    const vehicles = await Vehicle.find({ isDeleted: true }).sort({ createdAt: -1 });
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
    const { id } = req?.params;
    const { hardDelete } = req?.body;
    // const vehicle = await Vehicle.findOneAndUpdate({ _id: id }, { isDeleted: true, deletedBy: null }, { new: true });
    // if (!vehicle) {
    //   return res.status(404).json({ message: 'Vehicle not found' });
    // };
    console.log('Vehicle to be deleted:', req?.body);
    res.status(200).json({ message: 'Vehicle deleted successfully', });
  } catch (error) {
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
    handleError(res, error, 'Error updating vehicle');
  };
};

export const restoreAVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findOneAndUpdate({ _id: id }, { isDeleted: false, deletedBy: null }, { new: true });
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.status(200).json({ message: 'Vehicle restored successfully', vehicle: vehicle });
  } catch (error) {
    handleError(res, error, 'Error updating vehicle');
  };
};