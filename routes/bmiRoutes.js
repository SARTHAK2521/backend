const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const dataPath = path.join(__dirname, '../data/bmiData.json');

// Helper functions
const readData = (userId) => {
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const allData = JSON.parse(rawData || '{}');
        
        // Ensure the user's data is always an array
        if (!allData[userId] || !Array.isArray(allData[userId])) {
            allData[userId] = [];
        }
        
        return allData[userId];
    } catch (err) {
        // If file doesn't exist or is invalid, return empty array for this user
        return [];
    }
};

const writeData = (userId, data) => {
    let allData = {};
    try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        allData = JSON.parse(rawData || '{}');
    } catch (err) {
        // File doesn't exist or is invalid, we'll create new
    }
    
    // Ensure we're storing an array
    if (!Array.isArray(data)) {
        data = [];
    }
    
    allData[userId] = data;
    fs.writeFileSync(dataPath, JSON.stringify(allData, null, 2), 'utf8');
};

// BMI calculation function
const calculateBMI = (weight, height) => {
    const heightInMeters = height / 100;
    const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    
    let category, suggestion;
    
    if (bmi < 18.5) {
        category = "Underweight";
        suggestion = "Increase calorie intake with nutrient-dense foods like nuts, avocados, whole grains, and lean proteins. Consider smaller, more frequent meals.";
    } else if (bmi >= 18.5 && bmi < 25) {
        category = "Normal weight";
        suggestion = "Maintain a balanced diet with fruits, vegetables, whole grains, lean proteins, and healthy fats. Stay hydrated and exercise regularly.";
    } else if (bmi >= 25 && bmi < 30) {
        category = "Overweight";
        suggestion = "Focus on portion control, increase vegetable intake, reduce processed foods and sugars. Incorporate regular physical activity.";
    } else {
        category = "Obese";
        suggestion = "Consult a healthcare provider for a personalized plan. Focus on gradual weight loss through diet changes and increased activity.";
    }
    
    return { bmi, category, suggestion };
};

// Routes
router.get('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth');
    }
    
    const userId = req.session.user.id;
    res.render('bmi', { 
        title: 'BMI Calculator',
        result: null,
        history: readData(userId)
    });
});

router.post('/', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth');
    }

    const { weight, height, age, gender } = req.body;
    const userId = req.session.user.id;
    
    // Validate input
    if (!weight || !height || isNaN(weight) || isNaN(height)) {
        return res.status(400).render('bmi', {
            title: 'BMI Calculator',
            error: 'Please enter valid weight and height values',
            history: readData(userId)
        });
    }

    const result = calculateBMI(parseFloat(weight), parseFloat(height));
    
    // Get current history (ensured to be an array by readData)
    const history = readData(userId);
    
    // Add new entry
    history.unshift({
        date: new Date().toISOString(),
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: age ? parseInt(age) : null,
        gender: gender || 'unknown',
        ...result
    });
    
    // Save to history (keep only last 10 entries)
    writeData(userId, history.slice(0, 10));
    
    res.render('bmi', { 
        title: 'BMI Calculator',
        result,
        history: history.slice(0, 10)
    });
});

module.exports = router;