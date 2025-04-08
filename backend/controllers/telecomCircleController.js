import TelecomCircle from '../models/TelecomCircle.model.js';

/**
 * Get all telecom circles
 * @route GET /api/telecom-circles
 * @access Public
 */
const getTelecomCircles = async (req, res) => {
  try {
    const circles = await TelecomCircle.find({});
    res.status(200).json(circles);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching telecom circles', error: error.message });
  }
};

/**
 * Get a telecom circle by ID
 * @route GET /api/telecom-circles/:id
 * @access Public
 */
const getTelecomCircleById = async (req, res) => {
  try {
    const circle = await TelecomCircle.findOne({ id: req.params.id });
    
    if (!circle) {
      return res.status(404).json({ message: 'Telecom circle not found' });
    }
    
    res.status(200).json(circle);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching telecom circle', error: error.message });
  }
};

/**
 * Compare network coverage between operators for a specific circle
 * @route GET /api/telecom-circles/:id/compare
 * @access Public
 */
const compareOperators = async (req, res) => {
  try {
    const { id } = req.params;
    const circle = await TelecomCircle.findOne({ id });
    
    if (!circle) {
      return res.status(404).json({ message: 'Telecom circle not found' });
    }
    
    // Extract comparison data
    const comparison = {
      circle: {
        id: circle.id,
        name: circle.name,
        code: circle.code
      },
      operators: circle.operators,
      network_quality: circle.network_quality,
      average_data_speed: circle.average_data_speed,
      population_coverage: circle.population_coverage,
      recommendations: generateRecommendations(circle)
    };
    
    res.status(200).json(comparison);
  } catch (error) {
    res.status(500).json({ message: 'Error comparing operators', error: error.message });
  }
};

/**
 * Find best operator for a specific telecom circle based on criteria
 * @route GET /api/telecom-circles/:id/best-operator
 * @access Public
 */
const getBestOperator = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority } = req.query; // 'coverage', 'speed', or 'quality'
    
    const circle = await TelecomCircle.findOne({ id });
    
    if (!circle) {
      return res.status(404).json({ message: 'Telecom circle not found' });
    }
    
    const bestOperator = findBestOperator(circle, priority || 'quality');
    
    res.status(200).json({
      circle: {
        id: circle.id,
        name: circle.name
      },
      bestOperator
    });
  } catch (error) {
    res.status(500).json({ message: 'Error finding best operator', error: error.message });
  }
};

/**
 * Helper function to generate recommendations based on circle data
 */
function generateRecommendations(circle) {
  const recommendations = {};
  
  // Find best for coverage
  let maxCoverage = 0;
  let bestCoverageOp = null;
  
  // Find best for speed
  let maxSpeed = 0;
  let bestSpeedOp = null;
  
  // Find best for quality
  let maxQuality = 0;
  let bestQualityOp = null;
  
  for (const op of circle.operators) {
    // Check coverage
    if (circle.population_coverage[op] > maxCoverage) {
      maxCoverage = circle.population_coverage[op];
      bestCoverageOp = op;
    }
    
    // Check speed
    if (circle.average_data_speed[op] > maxSpeed) {
      maxSpeed = circle.average_data_speed[op];
      bestSpeedOp = op;
    }
    
    // Check quality
    if (circle.network_quality[op] > maxQuality) {
      maxQuality = circle.network_quality[op];
      bestQualityOp = op;
    }
  }
  
  recommendations.best_coverage = bestCoverageOp;
  recommendations.best_speed = bestSpeedOp;
  recommendations.best_quality = bestQualityOp;
  
  return recommendations;
}

/**
 * Helper function to find the best operator based on priority
 */
function findBestOperator(circle, priority) {
  const operators = circle.operators;
  let bestOperator = null;
  let maxValue = 0;
  
  switch (priority) {
    case 'coverage':
      for (const op of operators) {
        if (circle.population_coverage[op] > maxValue) {
          maxValue = circle.population_coverage[op];
          bestOperator = op;
        }
      }
      break;
      
    case 'speed':
      for (const op of operators) {
        if (circle.average_data_speed[op] > maxValue) {
          maxValue = circle.average_data_speed[op];
          bestOperator = op;
        }
      }
      break;
      
    case 'quality':
    default:
      for (const op of operators) {
        if (circle.network_quality[op] > maxValue) {
          maxValue = circle.network_quality[op];
          bestOperator = op;
        }
      }
      break;
  }
  
  return {
    operator: bestOperator,
    value: maxValue,
    metric: priority
  };
}

export {
  getTelecomCircles,
  getTelecomCircleById,
  compareOperators,
  getBestOperator
}; 