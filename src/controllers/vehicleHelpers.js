import axios from "axios";
import CompanyStats from "../models/companyStats.js";

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

    return data;
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
    

    return data;
  } catch (error) {
    throw error; // Let the calling function handle the error and response
  };
};

export const getNewVehicleFullData = async (registration, res) => {
  let lookupReserved = false;
    registration = 'RE22EUA'; // For testing purposes, you can replace this with any valid registration number to fetch data for that vehicle. In production, this should come from the request body or parameters.
  try {
    const companyStats = await CompanyStats.findOne().sort({ createdAt: 1 });
    if (!companyStats) {
      return res.status(500).json({ message: 'Company stats not found' });
    }

    const reservedStats = await CompanyStats.findOneAndUpdate(
      {
        _id: companyStats._id,
        vehiclesAddedThisMonth: { $lt: 100 }
      },
      {
        $inc: { vehiclesAddedThisMonth: 1 }
      },
      { new: true }
    );

    if (!reservedStats) {
      return res.status(429).json({ message: 'Not enough lookups remaining this month' });
    }

    lookupReserved = true;
    const carDetailsURL = `${process.env.CAR_DETAILS_API_URL}${process.env.CAR_DETAILS_SPEC}?apikey=${process.env.CAR_DETAILS_TEST_KEY}&vrm=${registration}`;

    console.log('Requesting full vehicle details from external API for registration number:', registration);
    const { data } = await axios.get(carDetailsURL);

    console.log('Checking if response contains expected vehicle details data...');
    if (!data?.VehicleRegistration || !data?.VehicleInformation) {
      throw new Error('Invalid response from vehicle details API');
    }

    // With the returned data create a new VehicleTwo document in the database

    return data;
  } catch (error) {
    if (lookupReserved) {
      try {
        await CompanyStats.findOneAndUpdate(
          {},
          { $inc: { vehiclesAddedThisMonth: -1 } },
          { sort: { createdAt: 1 } }
        );
      } catch (rollbackError) {
        console.error('Failed to rollback vehicle lookup charge:', rollbackError?.message);
      }
    }

    if (error?.response?.status) {
      return res.status(error.response.status).json({
        message: 'Vehicle details lookup failed',
        error: error?.response?.data || error?.message
      });
    }

    return res.status(500).json({ message: 'Vehicle details lookup failed', error: error?.message });
  }
};