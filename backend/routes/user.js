const express = require('express');
const conn = require('../connection');
const router = express.Router();
const bcrypt = require('bcrypt');
require('dotenv').config();


const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const authToken = require('./services/auth');
const checkRole = require('./services/checkRole');


router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const checkUserQuery = 'SELECT email FROM user WHERE email = ?';
      conn.query(checkUserQuery, [email], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Internal server error' });
        }
  
        if (result.length > 0) {
          return res.status(400).json({ message: 'User already exists!' });
        }
  
        const registerUserQuery = 'INSERT INTO user (name, email, password, status, role) VALUES (?, ?, ?, false, "user")';
        conn.query(registerUserQuery, [name, email, hashedPassword], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
          }
  
          return res.status(201).json({ message: 'User registered successfully!' });
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

    router.post('/login', async (req, res) => {
        try {
          const { email, password } = req.body;
      
          if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
          }
      
          const checkUserQuery = 'SELECT * FROM user WHERE email = ?';
          conn.query(checkUserQuery, [email], async (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: 'Internal server error' });
            }
      
            if (result.length === 0) {
              return res.status(400).json({ message: 'Invalid User' });
            }
      
            const isPasswordCorrect = await bcrypt.compare(password, result[0].password);
      
            if (!isPasswordCorrect) {
              return res.status(400).json({ message: 'Invalid Password' });
            }
      
            const token = jwt.sign({ id: result[0].id, role: result[0].role }, process.env.ACCESS_SECRET);
            if (result[0].status == false) {
              return res.status(400).json({ message: 'Please verify your email address' });
            }else{
                return res.status(200).json({ message: 'Logged in successfully', token });
            }
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Internal server error' });
        }
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.NODEMAILER_USER ,
                pass: process.env.NODEMAILER_PASS 
            }
            });

        router.post('/forgotpassword', async (req, res) => {
            try {
              const { email } = req.body;
          
              if (!email) {
                return res.status(400).json({ message: 'Email is required' });
              }
          
              const checkUserQuery = 'SELECT * FROM user WHERE email = ?';
              conn.query(checkUserQuery, [email], async (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }
          
                if (result.length === 0) {
                  return res.status(400).json({ message: 'Invalid User' });
                }

          
                const token = jwt.sign({ id: result[0].id }, process.env.ACCESS_SECRET);
                const mailOptions = {
                    from: process.env.NODEMAILER_USER ,
                    to: email,
                    subject: 'Reset Password',
                    html: `<h2>Click <a href="http://localhost:8080/">here</a> to reset your password</h2>`
                };
                transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Error send Mail' });
                    }
                    console.log('Email sent: ' + info.response);
                    return res.status(200).json({ message: 'Email sent successfully' });
                });
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Internal server error' });
            }
          });

          router.get('/get',authToken, checkRole , async (req, res) => {
            try {
              const getAllUserQuery = 'SELECT * FROM user WHERE role = "user"';
              conn.query(getAllUserQuery, (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }
            
                return res.status(200).json({ message: 'Get all user successfully', result });
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Internal server error' });
            }
          });

          router.get('/get/:id', async (req, res) => {
            try {
              const { id } = req.params;
          
              const getUserQuery = 'SELECT * FROM user WHERE id = ?';
              conn.query(getUserQuery, [id], (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }
          
                if (result.length === 0) {
                  return res.status(400).json({ message: 'User not found' });
                }
          
                return res.status(200).json({ message: 'Get user successfully', result: result[0] });
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Internal server error' });
            }
          });

          router.patch('/update/:id', authToken,checkRole,async (req, res) => {
            try {
              const { id } = req.params;
              const { name, contactNumber, email, password, status, role } = req.body;
          
              let updateParams = [];
              let updateFields = [];
          
              if (name !== undefined) {
                updateFields.push('name = ?');
                updateParams.push(name);
              }
              if (contactNumber !== undefined) {
                updateFields.push('contactNumber = ?');
                updateParams.push(contactNumber);
              }
              if (email !== undefined) {
                updateFields.push('email = ?');
                updateParams.push(email);
              }
              if (password !== undefined) {
                const hashedPassword = await bcrypt.hash(password, 10);
                updateFields.push('password = ?');
                updateParams.push(hashedPassword);
              }
              if (status !== undefined) {
                updateFields.push('status = ?');
                updateParams.push(status);
              }
              if (role !== undefined) {
                updateFields.push('role = ?');
                updateParams.push(role);
              }
          
              if (updateFields.length === 0) {
                // If no fields are provided, just return a success message
                return res.status(200).json({ message: 'No changes was made' });
              }
          
              const fieldsForQuery = updateFields.join(', ');
              updateParams.push(id);
          
              const updateUserQuery = `UPDATE user SET ${fieldsForQuery} WHERE id = ?`;
          
              conn.query(updateUserQuery, updateParams, (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }
          
                if (result.affectedRows === 0) {
                  return res.status(404).json({ message: 'User not found' });
                }
          
                return res.status(200).json({ message: 'User updated successfully' });
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Internal server error' });
            }
          });

          router.post('/changePassword/:id', async (req, res) => {
            try {
              const { id } = req.params;
              const { oldPassword, newPassword } = req.body;
          
              if (!oldPassword || !newPassword) {
                return res.status(400).json({ message: 'All fields are required' });
              }
          
              const getUserQuery = 'SELECT * FROM user WHERE id = ?';
              conn.query(getUserQuery, [id], async (err, result) => {
                if (err) {
                  console.error(err);
                  return res.status(500).json({ message: 'Internal server error' });
                }
          
                if (result.length === 0) {
                  return res.status(400).json({ message: 'User not found' });
                }
          
                const isPasswordCorrect = await bcrypt.compare(oldPassword, result[0].password);
          
                if (!isPasswordCorrect) {
                  return res.status(400).json({ message: 'Invalid Password' });
                }
          
                const hashedPassword = await bcrypt.hash(newPassword, 10);
          
                const updateUserQuery = 'UPDATE user SET password = ? WHERE id = ?';
                conn.query(updateUserQuery, [hashedPassword, id], (err, result) => {
                  if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Internal server error' });
                  }
          
                  return res.status(200).json({ message: 'Password updated successfully' });
                });
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({ message: 'Internal server error' });
            }
          });
          

module.exports = router;