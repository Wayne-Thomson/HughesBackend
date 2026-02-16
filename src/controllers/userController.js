export const loginUser = async (req, res) => {
  try {

    res.status(200).json({ message: 'Login successful', user: { id: 1, email: 'user@example.com', isAdmin: true } });
  } catch (error) {
    handleError(res, error, 'Error logging in user');
  }
}

export const listAllUsers = async (req, res) => {
  try {
    // Replace with actual logic to fetch users from your database
    const users = [
      { _id: 1, email: 'user1@example.com', userName: 'user1', fullName: 'User One', isAdmin: true },
      { _id: 2, email: 'user2@example.com', userName: 'user2', fullName: 'User Two', isAdmin: false },
    ];
    res.status(200).json({ message: 'Users fetched successfully', users });
  } catch (error) {
    handleError(res, error, 'Error fetching users');
  }
};

export const createUser = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error creating user');
  }
}

export const updateUser = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error updating user');
  }
}

export const deleteUser = async (req, res) => {
  try {

  } catch (error) {
    handleError(res, error, 'Error deleting user');
  }
}