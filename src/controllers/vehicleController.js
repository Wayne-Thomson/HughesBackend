export const getVehicles = async (req, res) => {
  try {

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
    const { registrationNumber } = req.body;
    const liveApi = process.env.APIkey;
    const DVLAURIlive = 'https://api.dvla.gov.uk/v1/vehicles';
    let accessToken = '';

    // Access token from Microsoft Identity Platform using the client credentials flow parameters from .env file
    const microstoftTokenURL = process.env.TokenURL;
    const clientId = process.env.ClientID;
    const clientSecret = process.env.ClientSecret;
    const scopeURL = process.env.ScopeURL;

    const headers = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
    };
    
    const payload = JSON.stringify({ 
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: scopeURL    
    });
    
    const tokenURL = microstoftTokenURL;
    
    const { data } = await axios.post(tokenURL, payload, headers);
    
    console.log('token API response:', data);

    res.status(200).json({ message: 'Note deleted successfully', data: "This is where the DVLA data will go" });
  } catch (error) {
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