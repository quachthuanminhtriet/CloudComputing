const express = require('express');
const { register, login, getAllUsers, updateUser } = require('../controllers/Users');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/all', getAllUsers);
router.put('/updateUser/:id', updateUser);

module.exports = router;
