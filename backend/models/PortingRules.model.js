import mongoose from 'mongoose';

// Porting Rules Schema
const portingRulesSchema = new mongoose.Schema(
  {
    circle: {
      type: String,
      required: [true, 'Please add a telecom circle'],
      unique: true,
      trim: true
    },
    workingDaysBeforePorting: {
      type: Number,
      required: [true, 'Please specify the number of working days before porting'],
      default: 3
    },
    holidayList: [{
      date: Date,
      description: String
    }],
    minUsagePeriod: {
      type: Number,
      required: [true, 'Please specify minimum usage period in days'],
      default: 90 // 90 days by default as per TRAI rules
    },
    duePaymentPeriod: {
      type: Number,
      required: [true, 'Please specify due payment period in days'],
      default: 15
    },
    portingFee: {
      withinCircle: {
        type: Number,
        default: 6.5 // in INR
      },
      outsideCircle: {
        type: Number,
        default: 19 // in INR
      }
    },
    specialInstructions: {
      type: String,
      default: ''
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Method to calculate SMS date based on plan end date
portingRulesSchema.statics.calculateSmsDate = async function(planEndDate, circleId) {
  // Find the rules for the given circle
  const rules = await this.findOne({ circle: circleId, active: true });
  if (!rules) {
    throw new Error(`No porting rules found for circle: ${circleId}`);
  }
  
  // Get working days requirement (3 days default, 5 for J&K)
  let requiredWorkingDays = rules.workingDaysBeforePorting;
  if (circleId && typeof circleId === 'string') {
    const circleLower = circleId.toLowerCase();
    if (circleLower.includes('jammu') || circleLower.includes('kashmir') || circleLower === 'j&k') {
      requiredWorkingDays = 5;
    }
  }
  
  // Get holidays as array of date strings
  const holidays = rules.holidayList.map(h => {
    const date = new Date(h.date);
    return date.toISOString().split('T')[0];
  });
  
  // Start from the end date
  const endDate = new Date(planEndDate);
  let currentDate = new Date(endDate);
  
  // We need to find a date that is exactly 'requiredWorkingDays' working days before the end date
  // The end date is included in the count if it's a working day
  let workingDaysCount = 0;
  
  // Check if end date is a working day (not Sunday, not holiday)
  const endDateDay = endDate.getDay();
  const endDateStr = endDate.toISOString().split('T')[0];
  if (endDateDay !== 0 && !holidays.includes(endDateStr)) {
    workingDaysCount = 1;
  }
  
  // Maximum days to look back to prevent infinite loop
  let maxDaysToCheck = requiredWorkingDays * 2 + 5;
  
  // Work backwards from end date until we find enough working days
  while (workingDaysCount < requiredWorkingDays && maxDaysToCheck > 0) {
    // Move one day back
    currentDate.setDate(currentDate.getDate() - 1);
    maxDaysToCheck--;
    
    // Check if current date is a working day
    const dayOfWeek = currentDate.getDay();
    const dateStr = currentDate.toISOString().split('T')[0];
    
    if (dayOfWeek !== 0 && !holidays.includes(dateStr)) {
      workingDaysCount++;
      
      // If we've found enough working days, this is our SMS date
      if (workingDaysCount === requiredWorkingDays) {
        return new Date(currentDate);
      }
    }
  }
  
  // Fallback - if we couldn't find enough working days, return current date
  return currentDate;
};

// Method to calculate porting date based on SMS date
portingRulesSchema.statics.calculatePortingDate = async function(smsDate, circleId) {
  // TRAI typically allows porting within 4-7 days of UPC generation
  // For simplicity, we'll set it to 4 days after SMS date
  const rules = await this.findOne({ circle: circleId, active: true });
  if (!rules) {
    throw new Error(`No porting rules found for circle: ${circleId}`);
  }
  
  const portingDate = new Date(smsDate);
  portingDate.setDate(portingDate.getDate() + 4);
  
  return portingDate;
};

const PortingRules = mongoose.model('PortingRules', portingRulesSchema);

export default PortingRules; 