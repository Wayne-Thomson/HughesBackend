import axios from 'axios';
import dotenv from 'dotenv';

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

    res.status(200).json({ message: 'Vehicles retrieved successfully', data: [] });
  } catch (error) {
    handleError(res, error, 'Error getting vehicles');
  }
}

export const getDeletedVehicles = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error getting deleted vehicles');
  }
}

export const getVehicle = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error getting vehicle');
  }
}

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
    console.log('token API response:', accessTokenData);

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

    console.log(registrationNumber)

    const { data } = await axios.get(`${DVLAURIlive}/${registrationNumber}`, headers);

    console.log('DVLA API response:', data);

    res.status(200).json({ message: 'Vehicle created successfully', data: "This is where the DVLA data will go" });
  } catch (error) {
    // console.log("Error creating vehicle:", error);
    handleError(res, error, 'Error creating vehicle');
  }
}

export const createVehicleVIN = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error creating vehicle');
  }
}

export const updateAVehicle = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error updating vehicle');
  }
}