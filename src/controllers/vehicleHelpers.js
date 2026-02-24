import axios from "axios";
import CompanyStats from "../models/companyStats.js";
import VehicleTwo from "../models/VehicleTwo.js";

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

export const getNewVehicleFullData = async (registration, res, confirmedVehicleDetails) => {
  let lookupReserved = false;
  try {
    console.log('Initiating process to get full vehicle details for registration number:', registration);
    
    // Use confirmed details if provided, otherwise fetch from API
    let basicVehicleDetails = confirmedVehicleDetails;

    console.log('Basic vehicle details:', basicVehicleDetails);
    if (!basicVehicleDetails) {
      return res.status(400).json({ message: 'Basic vehicle details are required to proceed with fetching full details' });
    }
    
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
    // CAR_DETAILS_API_KEY CAR_DETAILS_TEST_KEY
    const carDetailsURL = `${process.env.CAR_DETAILS_API_URL}${process.env.CAR_DETAILS_SPEC}?apikey=${process.env.CAR_DETAILS_TEST_KEY}&vrm=${registration}`;

    console.log('Requesting full vehicle details from external API for registration number:', registration);
    const { data } = await axios.get(carDetailsURL);
    console.log('Checking if response contains expected vehicle details data...');
    if (!data?.VehicleRegistration) {
      throw new Error('Invalid response from vehicle details API');
    }
    console.log('Vehicle details API response data:', data);
    // With the returned data create a new VehicleTwo document in the database
    const newVehicleTwo = {
      VehicleRegistration: data?.VehicleRegistration || null,
      Dimensions: data?.Dimensions || null,
      Engine: data?.Engine || null,
      Performance: data?.Performance || null,
      Consumption: data?.Consumption || null,
      VehicleHistory: data?.VehicleHistory || null,
      SmmtDetails: data?.SmmtDetails || null,
      vedRate: data?.vedRate || null,
      General: data?.General || null,
      registration: data?.VehicleRegistration?.Vrm || "Unknown",
      vin: data?.VehicleRegistration?.Vin || "Unknown",
      make: data?.VehicleRegistration?.Make || "Unknown",
      model: data?.VehicleRegistration?.Model || "Unknown",
      makeModel: data?.VehicleRegistration?.MakeModel || "Unknown",
      firstUsedDate: data?.VehicleRegistration?.DateFirstRegisteredUk || "Unknown",
      fuelType: data?.VehicleRegistration?.FuelType || "Unknown",
      primaryColour: data?.VehicleRegistration?.Colour || "Unknown",
      registrationDate: data?.VehicleRegistration?.DateFirstRegisteredUk || "Unknown",
      manufactureDate: data?.VehicleRegistration?.YearOfManufacture || "Unknown",
      engineSize: data?.VehicleRegistration?.EngineCapacity || "Unknown",
      hasOutstandingRecall: data?.VehicleRegistration?.HasOutstandingRecall || "Unknown",


      motTests: basicVehicleDetails?.motTests || [],
      customNotes: "",
      generation: "?",
      series: data?.VehicleRegistration?.Series || "Unknown",
      seriesDescription: data?.SmmtDetails?.SeriesDescription || "Unknown",
      country: data?.SmmtDetails?.CountryOfOrigin || "Unknown",
      engineCode: data?.VehicleRegistration?.EngineNumber || "Unknown",
      isDeleted: false,
      dateDeleted: null,
      deletedBy: null,
      createdBy: null
    };

    // Save the new VehicleTwo document to the database
    let savedVehicleTwo;
    try {
        savedVehicleTwo = await VehicleTwo.create(newVehicleTwo);
    } catch (error) {
        console.error('Error saving VehicleTwo document to database:', error);
        lookupReserved = false; // Reset lookup reservation flag since save failed after sending request to external API
        throw error;
    }

    return res.status(200).json({ message: 'Vehicle details fetched and saved successfully', vehicle: savedVehicleTwo });
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

export { createVehicleREG, createVehicleVIN };