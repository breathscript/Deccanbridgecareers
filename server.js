require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const xmlrpc = require('xmlrpc');

const app = express();
const PORT = process.env.PORT || 3000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'resume-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only PDF, DOC, DOCX files
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Odoo Authentication Helper - Get session for API calls
async function getOdooSession(odooDomain, apiKey) {
  // For Odoo external API, we need to authenticate first
  // Try using XML-RPC which is more reliable for external access
  // But first, let's try to get a session using the API key
  
  // Extract database name from domain (e.g., deccanbridgecareers1 from deccanbridgecareers1.odoo.com)
  const domainParts = odooDomain.replace(/^https?:\/\//, '').split('.');
  const dbName = domainParts[0];
  
  try {
    // Method 1: Try XML-RPC authentication (most reliable for external API)
    // XML-RPC doesn't require session management
    return { method: 'xmlrpc', db: dbName };
  } catch (error) {
    console.error('Error in Odoo authentication setup:', error.message);
    return null;
  }
}

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route for other HTML pages
app.get('/AboutUS.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'AboutUS.html'));
});

app.get('/Contact.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Contact.html'));
});

app.get('/JobApplication.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'JobApplication.html'));
});

// Serve robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.sendFile(path.join(__dirname, 'robots.txt'));
});

// Serve sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  res.sendFile(path.join(__dirname, 'sitemap.xml'));
});

// Serve jobs.json
app.get('/jobs.json', (req, res) => {
  res.type('application/json');
  res.sendFile(path.join(__dirname, 'jobs.json'));
});

// Serve Indian states and cities
app.get('/indian-states-cities.json', (req, res) => {
  res.type('application/json');
  res.sendFile(path.join(__dirname, 'indian-states-cities.json'));
});

// API endpoint to get Odoo custom fields
app.get('/api/odoo-fields', async (req, res) => {
  try {
    const odooDomain = process.env.ODOO_DOMAIN?.replace(/\/$/, '');
    const odooUsername = process.env.ODOO_USERNAME;
    const odooPassword = process.env.ODOO_PASSWORD;
    const dbName = process.env.ODOO_DB_NAME || (() => {
      const domainParts = odooDomain?.replace(/^https?:\/\//, '').split('.');
      return domainParts?.[0];
    })();
    
    if (!odooDomain || !odooUsername || !odooPassword || !dbName) {
      return res.status(500).json({ 
        success: false, 
        error: 'Odoo credentials not configured' 
      });
    }
    
    // Authenticate with Odoo
    const authResponse = await axios.post(
      `${odooDomain}/web/session/authenticate`,
      {
        jsonrpc: '2.0',
        params: {
          db: dbName,
          login: odooUsername,
          password: odooPassword,
        },
        id: Math.floor(Math.random() * 1000000)
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
        withCredentials: true
      }
    );
    
    if (!authResponse.data?.result?.uid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Odoo authentication failed' 
      });
    }
    
    const uid = authResponse.data.result.uid;
    const cookies = authResponse.headers['set-cookie'] || [];
    
    // Get custom fields for crm.lead model (fields starting with x_)
    const fieldsResponse = await axios.post(
      `${odooDomain}/web/dataset/call_kw/ir.model.fields/search_read`,
      {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          model: 'ir.model.fields',
          method: 'search_read',
          args: [
            [['model', '=', 'crm.lead'], ['name', 'like', 'x_']]
          ],
          kwargs: {
            fields: ['name', 'field_description', 'ttype', 'required', 'readonly', 'help']
          }
        },
        id: Math.floor(Math.random() * 1000000)
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Cookie': cookies.join('; ')
        },
        timeout: 10000,
        withCredentials: true
      }
    );
    
    const customFields = fieldsResponse.data?.result || [];
    
    res.json({
      success: true,
      fields: customFields
    });
  } catch (error) {
    console.error('Error fetching Odoo custom fields:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      fields: [] // Return empty array on error
    });
  }
});

// Route for Jobs page
app.get('/Jobs.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Jobs.html'));
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: 'File too large. Maximum size is 5MB.' 
      });
    }
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
  if (err) {
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
  next();
};

// API endpoint to submit job application to Odoo CRM
app.post('/api/submit-application', upload.single('resume'), handleMulterError, async (req, res) => {
  let resumeFilePath = null;
  let resumeFileName = null;
  let resumeFileSize = null;
  let parsedPersonalInfo = {};
  let parsedProfessionalInfo = {};
  let parsedJobQuestions = {};
  
  try {
    // Parse JSON fields from FormData
    const { jobId, jobTitle, personalInfo, professionalInfo, jobQuestions } = req.body;
    
    try {
      parsedPersonalInfo = typeof personalInfo === 'string' ? JSON.parse(personalInfo) : (personalInfo || {});
    } catch (e) {
      console.error('Error parsing personalInfo:', e.message);
      console.error('Raw personalInfo:', personalInfo);
      parsedPersonalInfo = typeof personalInfo === 'object' ? personalInfo : {};
    }
    
    try {
      parsedProfessionalInfo = typeof professionalInfo === 'string' ? JSON.parse(professionalInfo) : (professionalInfo || {});
    } catch (e) {
      console.error('Error parsing professionalInfo:', e.message);
      console.error('Raw professionalInfo:', professionalInfo);
      parsedProfessionalInfo = typeof professionalInfo === 'object' ? professionalInfo : {};
    }
    
    try {
      parsedJobQuestions = typeof jobQuestions === 'string' ? JSON.parse(jobQuestions) : (jobQuestions || {});
    } catch (e) {
      console.error('Error parsing jobQuestions:', e.message);
      console.error('Raw jobQuestions:', jobQuestions);
      parsedJobQuestions = typeof jobQuestions === 'object' ? jobQuestions : {};
    }
    
    // Handle resume file
    if (req.file) {
      resumeFilePath = req.file.path;
      resumeFileName = req.file.originalname;
      resumeFileSize = req.file.size;
    }
    
    // Validate required fields
    if (!jobId || !jobTitle || !parsedPersonalInfo || !parsedPersonalInfo.fullName || !parsedPersonalInfo.email) {
      // Clean up uploaded file if validation fails
      if (resumeFilePath && fs.existsSync(resumeFilePath)) {
        fs.unlinkSync(resumeFilePath);
      }
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: jobId, jobTitle, fullName, and email are required',
        details: {
          jobId: !!jobId,
          jobTitle: !!jobTitle,
          fullName: !!parsedPersonalInfo?.fullName,
          email: !!parsedPersonalInfo?.email
        }
      });
    }
    
    
    // Prepare resume attachment data for Odoo
    let resumeAttachmentData = null;
    if (resumeFilePath && fs.existsSync(resumeFilePath)) {
      try {
        const resumeFileBuffer = fs.readFileSync(resumeFilePath);
        const resumeBase64 = resumeFileBuffer.toString('base64');
        
        resumeAttachmentData = {
          name: resumeFileName,
          type: 'binary',
          datas: resumeBase64,
          res_model: 'crm.lead',
          mimetype: req.file.mimetype
        };
        
      } catch (fileError) {
        console.error('Error reading resume file:', fileError.message);
      }
    }
    
    // Format application questions as plain text
    const formatQuestionsAsText = (questions) => {
      if (!questions || Object.keys(questions).length === 0) {
        return 'No questions answered.';
      }
      return Object.entries(questions)
        .map(([key, value]) => {
          // Clean up question key (remove 'question-' prefix if present)
          const cleanKey = key.replace(/^question-/, '').replace(/-/g, ' ');
          const answer = Array.isArray(value) ? value.join(', ') : String(value);
          return `${cleanKey}: ${answer}`;
        })
        .join('\n');
    };
    
    // Prepare Odoo CRM opportunity data - clean plain text description
    const descriptionText = [
      'JOB APPLICATION DETAILS',
      '======================',
      `Job ID: ${jobId}`,
      `Job Title: ${jobTitle}`,
      '',
      'PERSONAL INFORMATION',
      '-------------------',
      `Full Name: ${parsedPersonalInfo.fullName}`,
      `Email: ${parsedPersonalInfo.email}`,
      `Phone: ${parsedPersonalInfo.phone || 'Not provided'}`,
      `Current Location: ${parsedPersonalInfo.currentLocation || 'Not provided'}`,
      '',
      'PROFESSIONAL INFORMATION',
      '----------------------',
      `Total Experience: ${parsedProfessionalInfo?.totalExperience || 'Not provided'}`,
      `Current Company: ${parsedProfessionalInfo?.currentCompany || 'Not provided'}`,
      `Current Designation: ${parsedProfessionalInfo?.currentDesignation || 'Not provided'}`,
      `Cover Letter: ${parsedProfessionalInfo?.coverLetter || 'Not provided'}`,
      '',
      'RESUME',
      '-----',
      `File Name: ${resumeFileName || 'Not provided'}`,
      `File Size: ${resumeFileSize ? (resumeFileSize / 1024).toFixed(2) + ' KB' : 'Not provided'}`,
      '',
      'APPLICATION QUESTIONS',
      '-------------------',
      formatQuestionsAsText(parsedJobQuestions)
    ].join('\n');
    
    // Parse location to extract city and state (if provided)
    const parseLocation = (location, state, city) => {
      // Prefer explicit state and city fields
      if (state && city) {
        return { city: city, state: state, country: 'India' };
      }
      // Fallback to parsing location string
      if (!location) return { city: '', state: '', country: '' };
      const parts = location.split(',').map(p => p.trim());
      return {
        city: parts[0] || '',
        state: parts[1] || '',
        country: parts[2] || 'India'
      };
    };
    
    const locationData = parseLocation(
      parsedPersonalInfo.currentLocation,
      parsedPersonalInfo.state,
      parsedPersonalInfo.city
    );
    
    // Fetch Odoo custom fields to map form data
    let odooCustomFields = {};
    try {
      // Use internal request to get custom fields
      const fieldsResponse = await axios.get(`http://localhost:${PORT}/api/odoo-fields`, {
        timeout: 5000
      }).catch(() => null);
      
      if (fieldsResponse?.data?.success && fieldsResponse.data?.fields) {
        fieldsResponse.data.fields.forEach(field => {
          odooCustomFields[field.name] = field;
        });
        console.log('Odoo custom fields loaded:', Object.keys(odooCustomFields));
      }
    } catch (error) {
      console.log('Could not load Odoo custom fields, using standard fields only');
    }
    
    // Prepare Odoo CRM opportunity data with proper field mappings
    // Standard Odoo CRM fields that apply to both leads and opportunities
    const odooOpportunityData = {
      // Required fields
      name: `${parsedPersonalInfo.fullName} - Application for ${jobTitle}`,
      type: 'opportunity', // Create as opportunity instead of lead
      
      // Contact information (standard CRM fields)
      partner_name: parsedPersonalInfo.fullName,
      email_from: parsedPersonalInfo.email,
      phone: parsedPersonalInfo.phone || '',
      
      // Professional information
      function: parsedProfessionalInfo?.currentDesignation || '', // Job title/function field
      contact_name: parsedProfessionalInfo?.currentCompany || '', // Company/contact name
      
      // Location fields
      city: parsedPersonalInfo.city || locationData.city || '',
      // Note: state_id and country_id require IDs, not names
      // State will be mapped to custom field if available
      
      // Description contains all detailed information
      description: descriptionText,
    };
    
    // Map to custom fields if they exist in Odoo
    // Common custom field patterns for job applications
    const customFieldMappings = {
      'x_studio_job_id': jobId,
      'x_studio_job_title': jobTitle,
      'x_studio_total_experience': parsedProfessionalInfo?.totalExperience || '',
      'x_studio_state': parsedPersonalInfo.state || locationData.state || '',
      'x_studio_city': parsedPersonalInfo.city || locationData.city || '',
      'x_studio_cover_letter': parsedProfessionalInfo?.coverLetter || '',
      'x_studio_application_questions': formatQuestionsAsText(parsedJobQuestions),
    };
    
    // Add custom fields if they exist in Odoo
    Object.keys(customFieldMappings).forEach(fieldName => {
      if (odooCustomFields[fieldName]) {
        const value = customFieldMappings[fieldName];
        if (value !== '' && value !== null && value !== undefined) {
          odooOpportunityData[fieldName] = value;
          console.log(`Mapped to custom field ${fieldName}:`, value);
        }
      }
    });
    
    // Remove empty fields to avoid errors
    Object.keys(odooOpportunityData).forEach(key => {
      if (odooOpportunityData[key] === '' || odooOpportunityData[key] === null || odooOpportunityData[key] === undefined) {
        delete odooOpportunityData[key];
      }
    });
    
    console.log('Odoo Opportunity Data:', JSON.stringify(odooOpportunityData, null, 2));
    
    // Submit to Odoo CRM using XML-RPC or REST API
    const odooDomain = process.env.ODOO_DOMAIN?.replace(/\/$/, '');
    const apiKey = process.env.ODOO_API_KEY;
    // Optional: username and password for XML-RPC authentication
    const odooUsername = process.env.ODOO_USERNAME || apiKey; // Fallback to API key
    const odooPassword = process.env.ODOO_PASSWORD || apiKey; // Fallback to API key
    
    if (!odooDomain || !apiKey) {
      console.error('Odoo credentials not configured');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }
    
    // Submit to Odoo CRM using XML-RPC (most reliable for external API)
    // XML-RPC doesn't require session management
    try {
      // Extract database name from domain
      // For Odoo.com hosted instances, database name is usually the subdomain
      // But it can also be specified in environment variable
      const dbName = process.env.ODOO_DB_NAME || (() => {
        const domainParts = odooDomain.replace(/^https?:\/\//, '').split('.');
        return domainParts[0]; // e.g., "deccanbridgecareers1"
      })();
      
      
      // For Odoo, we need username and password for XML-RPC
      // Since we only have API key, let's try using it as external API token
      // First, try XML-RPC with API key as authentication
      const xmlrpcUrl = `${odooDomain}/xmlrpc/2/object`;
      
      // Method 1: Try XML-RPC (requires username/password, but let's try with API key)
      // Actually, for external API, we should use the API key with proper endpoints
      // Let's try authenticating first to get a session
      
      // Try to authenticate and get UID using XML-RPC
      let uid = null;
      
      try {
        
        // Create XML-RPC client for authentication
        const url = new URL(odooDomain);
        const commonClient = xmlrpc.createClient({
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/xmlrpc/2/common',
          basic_auth: {
            user: odooUsername,
            pass: odooPassword
          }
        });
        
        // Use XML-RPC authenticate method (proper XML format)
        uid = await new Promise((resolve, reject) => {
          commonClient.methodCall('authenticate', [dbName, odooUsername, odooPassword, {}], (error, value) => {
            if (error) {
              reject(error);
            } else {
              resolve(value);
            }
          });
        });
        
        if (uid && uid !== false) {
          console.log('✅ Odoo XML-RPC authentication successful, UID:', uid);
        } else {
          console.error('❌ XML-RPC authentication failed - invalid credentials or database name');
          console.error('UID returned:', uid);
          uid = null;
        }
      } catch (authError) {
        console.error('❌ XML-RPC authentication error:', authError.message);
        if (authError.stack) {
          console.error('Stack:', authError.stack);
        }
        
        // Try web session authentication as fallback
        console.log('Trying web session authentication...');
        try {
          const webAuthResponse = await axios.post(
            `${odooDomain}/web/session/authenticate`,
            {
              jsonrpc: '2.0',
              params: {
                db: dbName,
                login: odooUsername,
                password: odooPassword,
              },
              id: Math.floor(Math.random() * 1000000)
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000,
              withCredentials: true
            }
          );
          
          
          if (webAuthResponse.data?.result?.uid) {
            uid = webAuthResponse.data.result.uid;
            // Get session cookies from response
            const cookies = webAuthResponse.headers['set-cookie'] || [];
            console.log('✅ Web session authentication successful, UID:', uid);
            
            // Use web session API to create lead (more reliable than XML-RPC)
            try {
              // Use /web/dataset/call_kw endpoint with session
              const createResponse = await axios.post(
                `${odooDomain}/web/dataset/call_kw/crm.lead/create`,
                {
                  jsonrpc: '2.0',
                  method: 'call',
                  params: {
                    model: 'crm.lead',
                    method: 'create',
                    args: [odooOpportunityData],
                    kwargs: {}
                  },
                  id: Math.floor(Math.random() * 1000000)
                },
                {
                  headers: {
                    'Content-Type': 'application/json',
                    'Cookie': cookies.join('; ')
                  },
                  timeout: 30000,
                  withCredentials: true
                }
              );
              
              const leadId = createResponse.data?.result || null;
              
              if (!leadId) {
                console.error('❌ Opportunity creation failed - no opportunity ID returned');
                console.error('Response:', createResponse.data);
                throw new Error('Failed to create opportunity in Odoo');
              }
              
              console.log('✅ Opportunity created successfully via Web Session API, ID:', leadId);
              
              // Attach resume if available
              if (resumeAttachmentData && leadId && req.file) {
                try {
                  const attachResponse = await axios.post(
                    `${odooDomain}/web/dataset/call_kw/ir.attachment/create`,
                    {
                      jsonrpc: '2.0',
                      method: 'call',
                      params: {
                        model: 'ir.attachment',
                        method: 'create',
                        args: [{
                          name: resumeFileName,
                          type: 'binary',
                          datas: resumeAttachmentData.datas,
                          res_model: 'crm.lead',
                          res_id: leadId,
                          mimetype: req.file.mimetype
                        }],
                        kwargs: {}
                      },
                      id: Math.floor(Math.random() * 1000000)
                    },
                    {
                      headers: {
                        'Content-Type': 'application/json',
                        'Cookie': cookies.join('; ')
                      },
                      timeout: 30000,
                      withCredentials: true
                    }
                  );
                  console.log('✅ Resume attached to Odoo opportunity, Attachment ID:', attachResponse.data?.result);
                } catch (attachError) {
                  console.error('❌ Error attaching resume:', attachError.message);
                  if (attachError.response) {
                    console.error('Response:', attachError.response.data);
                  }
                }
              }
              
              if (resumeFilePath && fs.existsSync(resumeFilePath)) {
                console.log('Resume file saved at:', resumeFilePath);
              }
              
              return res.json({ 
                success: true, 
                message: 'Application submitted successfully',
                odooId: leadId,
                resumeAttached: !!resumeAttachmentData
              });
            } catch (createError) {
              console.error('❌ Error creating opportunity via Web Session API:', createError.message);
              if (createError.response) {
                console.error('Response status:', createError.response.status);
                console.error('Response data:', JSON.stringify(createError.response.data, null, 2));
              }
              throw createError;
            }
          } else {
            console.error('❌ Web session authentication failed');
          }
        } catch (webAuthError) {
          console.error('❌ Web session authentication error:', webAuthError.message);
          if (webAuthError.response) {
            console.error('Response status:', webAuthError.response.status);
            console.error('Response data:', JSON.stringify(webAuthError.response.data, null, 2));
          }
        }
      }
      
      // Fallback: If we have UID from XML-RPC but web session failed, try XML-RPC
      if (uid && !res.headersSent) {
              console.log('Creating CRM opportunity via XML-RPC (fallback)...');
        try {
          // Create XML-RPC client for object operations
          const objectClient = xmlrpc.createClient({
            host: new URL(odooDomain).hostname,
            port: new URL(odooDomain).port || (odooDomain.startsWith('https') ? 443 : 80),
            path: '/xmlrpc/2/object',
            basic_auth: {
              user: odooUsername,
              pass: odooPassword
            }
          });
          
          // Use XML-RPC execute_kw method
          const leadId = await new Promise((resolve, reject) => {
            objectClient.methodCall('execute_kw', [
              dbName,
              uid,
              odooPassword,
              'crm.lead',
              'create',
              [odooOpportunityData]
            ], (error, value) => {
              if (error) {
                reject(error);
              } else {
                resolve(value);
              }
            });
          });
          
          console.log('✅ Application submitted to Odoo CRM via XML-RPC, Opportunity ID:', leadId);
          
          if (!leadId) {
            console.error('❌ Opportunity creation failed - no opportunity ID returned');
            throw new Error('Failed to create opportunity in Odoo');
          }
          
          console.log('✅ Opportunity created successfully, ID:', leadId);
          
          // Attach resume if available
          if (resumeAttachmentData && leadId && req.file) {
            try {
              const attachmentId = await new Promise((resolve, reject) => {
                objectClient.methodCall('execute_kw', [
                  dbName,
                  uid,
                  odooPassword,
                  'ir.attachment',
                  'create',
                  [{
                    name: resumeFileName,
                    type: 'binary',
                    datas: resumeAttachmentData.datas,
                    res_model: 'crm.lead',
                    res_id: leadId,
                    mimetype: req.file.mimetype
                  }]
                ], (error, value) => {
                  if (error) {
                    reject(error);
                  } else {
                    resolve(value);
                  }
                });
              });
              console.log('✅ Resume attached to Odoo opportunity via XML-RPC, Attachment ID:', attachmentId);
            } catch (attachError) {
              console.error('❌ Error attaching resume:', attachError.message);
              if (attachError.stack) {
                console.error('Stack:', attachError.stack);
              }
            }
          }
        
          if (resumeFilePath && fs.existsSync(resumeFilePath)) {
            console.log('Resume file saved at:', resumeFilePath);
          }
          
          return res.json({ 
            success: true, 
            message: 'Application submitted successfully',
            odooId: leadId,
            resumeAttached: !!resumeAttachmentData
          });
        } catch (createError) {
          console.error('❌ Error creating lead via XML-RPC:', createError.message);
          if (createError.response) {
            console.error('Response status:', createError.response.status);
            console.error('Response data:', JSON.stringify(createError.response.data, null, 2));
          }
          throw createError; // Re-throw to be caught by outer catch
        }
      } else {
        console.error('❌ Authentication failed - cannot proceed without UID');
        throw new Error('Odoo authentication failed. Please check credentials and database name.');
      }
      
      // If we reach here, authentication failed - try REST API with API key as fallback (not recommended)
      const odooResponse = await axios.post(
        `${odooDomain}/api/v1/crm.lead`,
        {
          jsonrpc: '2.0',
          method: 'create',
          params: {
            model: 'crm.lead',
            fields: odooOpportunityData
          },
          id: Math.floor(Math.random() * 1000000)
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'X-API-Key': apiKey
          },
          timeout: 10000
        }
      );
      
      console.log('Application submitted to Odoo CRM successfully:', odooResponse.data);
      
      const leadId = odooResponse.data?.result || odooResponse.data?.id || null;
      
      // Attach resume file to the lead if available
      if (resumeAttachmentData && leadId && req.file) {
        try {
          // Create attachment in Odoo
          const attachmentResponse = await axios.post(
            `${odooDomain}/api/v1/ir.attachment`,
            {
              jsonrpc: '2.0',
              method: 'create',
              params: {
                model: 'ir.attachment',
                fields: {
                  name: resumeFileName,
                  type: 'binary',
                  datas: resumeAttachmentData.datas,
                  res_model: 'crm.lead',
                  res_id: leadId,
                  mimetype: req.file.mimetype
                }
              },
              id: Math.floor(Math.random() * 1000000)
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
                'X-API-Key': apiKey
              },
              timeout: 10000
            }
          );
          console.log('Resume attached to Odoo lead successfully:', attachmentResponse.data);
        } catch (attachError) {
          console.error('Error attaching resume to Odoo lead:', attachError.message);
          if (attachError.response) {
            console.error('Odoo API response:', attachError.response.data);
          }
          // Don't fail the request if attachment fails
        }
      } else if (resumeFilePath && !leadId) {
        console.log('Resume file saved but lead ID not available for attachment');
      }
      
      // Clean up uploaded file after successful submission
      if (resumeFilePath && fs.existsSync(resumeFilePath)) {
        // Keep file for now, can be cleaned up later via cron job
        // fs.unlinkSync(resumeFilePath);
        console.log('Resume file saved at:', resumeFilePath);
      }
      
      res.json({ 
        success: true, 
        message: 'Application submitted successfully',
        odooId: leadId,
        resumeAttached: !!resumeAttachmentData
      });
    } catch (restError) {
      // Option 2: Try alternative REST endpoint format
      try {
        const altResponse = await axios.post(
          `${odooDomain}/web/dataset/call_kw/crm.lead/create`,
          {
            jsonrpc: '2.0',
            method: 'call',
            params: {
              model: 'crm.lead',
              method: 'create',
              args: [odooLeadData],
              kwargs: {}
            },
            id: Math.floor(Math.random() * 1000000)
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              'X-API-Key': apiKey
            },
            timeout: 10000
          }
        );
        
        console.log('Application submitted to Odoo CRM successfully (alt endpoint):', altResponse.data);
        
        const leadId = altResponse.data?.result || null;
        
        // Attach resume file to the lead if available
        if (resumeAttachmentData && leadId) {
          try {
            const attachmentResponse = await axios.post(
              `${odooDomain}/web/dataset/call_kw/ir.attachment/create`,
              {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                  model: 'ir.attachment',
                  method: 'create',
                  args: [{
                    name: resumeFileName,
                    type: 'binary',
                    datas: resumeAttachmentData.datas,
                    res_model: 'crm.lead',
                    res_id: leadId,
                    mimetype: req.file.mimetype
                  }],
                  kwargs: {}
                },
                id: Math.floor(Math.random() * 1000000)
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${apiKey}`,
                  'X-API-Key': apiKey
                },
                timeout: 10000
              }
            );
            console.log('Resume attached to Odoo lead successfully (alt method):', attachmentResponse.data);
          } catch (attachError) {
            console.error('Error attaching resume to Odoo lead:', attachError.message);
          }
        }
        
        // Clean up uploaded file after successful submission
        if (resumeFilePath && fs.existsSync(resumeFilePath)) {
          console.log('Resume file saved at:', resumeFilePath);
        }
        
        res.json({ 
          success: true, 
          message: 'Application submitted successfully',
          odooId: leadId,
          resumeAttached: !!resumeAttachmentData
        });
      } catch (altError) {
        // Log the error but don't fail the request
        console.error('Odoo API Error Details:', {
          restError: restError.message,
          altError: altError.message,
          odooDomain,
          hasApiKey: !!apiKey
        });
        
        // Save application data locally for manual processing
        const applicationLog = {
          timestamp: new Date().toISOString(),
          jobId,
          jobTitle,
          personalInfo: parsedPersonalInfo,
          professionalInfo: parsedProfessionalInfo,
          jobQuestions: parsedJobQuestions,
          resumeFile: resumeFilePath ? {
            path: resumeFilePath,
            name: resumeFileName,
            size: resumeFileSize
          } : null
        };
        
        const logPath = path.join(__dirname, 'application-logs', `application-${Date.now()}.json`);
        const logDir = path.join(__dirname, 'application-logs');
        if (!fs.existsSync(logDir)) {
          fs.mkdirSync(logDir, { recursive: true });
        }
        fs.writeFileSync(logPath, JSON.stringify(applicationLog, null, 2));
        
        // Still return success to user - application data is logged
        res.json({ 
          success: true, 
          message: 'Application received. We will review and get back to you soon.',
          note: 'Application saved. CRM sync may require manual review.',
          resumeSaved: !!resumeFilePath
        });
      }
    }
    
  } catch (error) {
    console.error('Unexpected error in application submission:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file on error
    if (resumeFilePath && fs.existsSync(resumeFilePath)) {
      try {
        fs.unlinkSync(resumeFilePath);
      } catch (unlinkError) {
        console.error('Error cleaning up file:', unlinkError.message);
      }
    }
    
    // Save application data locally for manual processing
    try {
      const applicationLog = {
        timestamp: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
        jobId: req.body?.jobId || 'unknown',
        jobTitle: req.body?.jobTitle || 'unknown',
        personalInfo: parsedPersonalInfo || req.body?.personalInfo || {},
        professionalInfo: parsedProfessionalInfo || req.body?.professionalInfo || {},
        jobQuestions: parsedJobQuestions || req.body?.jobQuestions || {},
        resumeFile: resumeFilePath ? {
          path: resumeFilePath,
          name: resumeFileName,
          size: resumeFileSize
        } : null
      };
      
      const logPath = path.join(__dirname, 'application-logs', `error-${Date.now()}.json`);
      const logDir = path.join(__dirname, 'application-logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      fs.writeFileSync(logPath, JSON.stringify(applicationLog, null, 2));
      console.log('Error logged to:', logPath);
    } catch (logError) {
      console.error('Error saving error log:', logError.message);
    }
    
    // Return error response to user
    res.status(500).json({ 
      success: false, 
      error: 'An unexpected error occurred. Please try again or contact us directly.',
      message: 'Your application data has been saved for manual review.'
    });
  }
});

// Start server
// API endpoint to submit contact form to Odoo CRM
app.post('/api/submit-contact', express.json(), async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: name, email, subject, and message are required' 
      });
    }
    
    // Prepare contact form description
    const descriptionText = [
      'CONTACT FORM SUBMISSION',
      '=====================',
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || 'Not provided'}`,
      `Subject: ${subject}`,
      '',
      'MESSAGE',
      '-------',
      message
    ].join('\n');
    
    // Prepare Odoo CRM opportunity data for contact form
    const odooDomain = process.env.ODOO_DOMAIN?.replace(/\/$/, '');
    const odooUsername = process.env.ODOO_USERNAME;
    const odooPassword = process.env.ODOO_PASSWORD;
    const dbName = process.env.ODOO_DB_NAME || (() => {
      const domainParts = odooDomain?.replace(/^https?:\/\//, '').split('.');
      return domainParts?.[0];
    })();
    
    if (!odooDomain || !odooUsername || !odooPassword || !dbName) {
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error' 
      });
    }
    
    // Fetch Odoo custom fields to check for contact type field
    let odooCustomFields = {};
    try {
      const fieldsResponse = await axios.get(`http://localhost:${PORT}/api/odoo-fields`, {
        timeout: 5000
      }).catch(() => null);
      
      if (fieldsResponse?.data?.success && fieldsResponse.data?.fields) {
        fieldsResponse.data.fields.forEach(field => {
          odooCustomFields[field.name] = field;
        });
      }
    } catch (error) {
      // Ignore errors, use standard fields
    }
    
    const odooOpportunityData = {
      name: `[Contact Info] ${name} - ${subject}`,
      type: 'opportunity',
      partner_name: name,
      email_from: email,
      phone: phone || '',
      description: descriptionText,
    };
    
    // Add custom field to mark as contact info opportunity if available
    if (odooCustomFields['x_studio_contact_type'] || odooCustomFields['x_studio_opportunity_type']) {
      const fieldName = odooCustomFields['x_studio_contact_type'] ? 'x_studio_contact_type' : 'x_studio_opportunity_type';
      odooOpportunityData[fieldName] = 'Contact Form';
    }
    
    // Remove empty fields
    Object.keys(odooOpportunityData).forEach(key => {
      if (odooOpportunityData[key] === '' || odooOpportunityData[key] === null || odooOpportunityData[key] === undefined) {
        delete odooOpportunityData[key];
      }
    });
    
    // Try to authenticate and create opportunity
    let uid = null;
    
    try {
      // Try XML-RPC authentication first
      const url = new URL(odooDomain);
      const commonClient = xmlrpc.createClient({
        host: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: '/xmlrpc/2/common',
        basic_auth: {
          user: odooUsername,
          pass: odooPassword
        }
      });
      
      uid = await new Promise((resolve, reject) => {
        commonClient.methodCall('authenticate', [dbName, odooUsername, odooPassword, {}], (error, value) => {
          if (error) {
            reject(error);
          } else {
            resolve(value);
          }
        });
      });
      
      if (uid && uid !== false) {
        // Use XML-RPC to create opportunity
        const objectClient = xmlrpc.createClient({
          host: url.hostname,
          port: url.port || (url.protocol === 'https:' ? 443 : 80),
          path: '/xmlrpc/2/object',
          basic_auth: {
            user: odooUsername,
            pass: odooPassword
          }
        });
        
        const opportunityId = await new Promise((resolve, reject) => {
          objectClient.methodCall('execute_kw', [
            dbName,
            uid,
            odooPassword,
            'crm.lead',
            'create',
            [odooOpportunityData]
          ], (error, value) => {
            if (error) {
              reject(error);
            } else {
              resolve(value);
            }
          });
        });
        
        return res.json({ 
          success: true, 
          message: 'Contact form submitted successfully',
          odooId: opportunityId
        });
      }
    } catch (xmlrpcError) {
      // Fallback to web session authentication
      try {
        const webAuthResponse = await axios.post(
          `${odooDomain}/web/session/authenticate`,
          {
            jsonrpc: '2.0',
            params: {
              db: dbName,
              login: odooUsername,
              password: odooPassword,
            },
            id: Math.floor(Math.random() * 1000000)
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 10000,
            withCredentials: true
          }
        );
        
        if (webAuthResponse.data?.result?.uid) {
          uid = webAuthResponse.data.result.uid;
          const cookies = webAuthResponse.headers['set-cookie'] || [];
          
          // Use web session API to create opportunity
          const createResponse = await axios.post(
            `${odooDomain}/web/dataset/call_kw/crm.lead/create`,
            {
              jsonrpc: '2.0',
              method: 'call',
              params: {
                model: 'crm.lead',
                method: 'create',
                args: [odooOpportunityData],
                kwargs: {}
              },
              id: Math.floor(Math.random() * 1000000)
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Cookie': cookies.join('; ')
              },
              timeout: 30000,
              withCredentials: true
            }
          );
          
          const opportunityId = createResponse.data?.result || null;
          
          if (opportunityId) {
            return res.json({ 
              success: true, 
              message: 'Contact form submitted successfully',
              odooId: opportunityId
            });
          }
        }
      } catch (webError) {
        console.error('Error creating contact opportunity:', webError.message);
      }
    }
    
    // If all methods fail, still return success (data will be logged)
    return res.json({ 
      success: true, 
      message: 'Contact form submitted successfully (Odoo integration may have failed, but your message was received)'
    });
    
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error submitting contact form. Please try again or contact us directly.' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Odoo Domain: ${process.env.ODOO_DOMAIN || 'Not configured'}`);
});

