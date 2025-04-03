const express = require('express');
const router = express.Router();
const planController = require('../controllers/planController');

// Get all plans with filtering
router.get('/plans', planController.getPlans);

// Get recommended plans
router.get('/plans/recommended', planController.getRecommendedPlans);

// Compare plans
router.post('/plans/compare', planController.comparePlans);

// Get similar plans for comparison
router.get('/plans/similar', planController.getSimilarPlans);

// Get plans by operator
router.get('/operators/:operator/plans', planController.getPlansByOperator);

// Get, update and delete a specific plan
router.get('/plans/:id', planController.getPlanById);
router.put('/plans/:id', planController.updatePlan);
router.delete('/plans/:id', planController.deletePlan);

// Create a new plan
router.post('/plans', planController.createPlan);

module.exports = router; 