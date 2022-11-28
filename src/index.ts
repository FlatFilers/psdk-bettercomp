/**
 * This is a scaffold for defining a Workbook with Sheets and Portals.
 * Test this scaffold using the sample file in examples/sample-uploads/my-sheet-sample.csv.
 *
 * See examples/workbooks/FullExample.ts for a full, working example of a Workbook.
 */

import {
  NumberField,
//  Portal,
  Sheet,
  TextField,
  Workbook,
  LinkedField,
  BooleanField,
  DateField,
  OptionField
} from '@flatfile/configure'

/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */


const SalaryRange = new Sheet('SalaryRange', {
  salaryGroup: TextField({
    label: 'Salary Group',
    required: true,
    description: 'Salary range group. Used when there are multiple min-mid-max values or currencies associated with a single structure + grade combination. Commonly seen for premium or discounted range variations as well as location differentiators for geographically disparate ranges, including global versioning.'
  }),
// Quick note on these two. I'm not sure if they're independently unique, or the combination of the two is unique? If so, I might create a composite field
// in this dataset for the uniqueness check, as well as a composite field in the Jobs dataset to create a link
  structure: TextField({
    label: 'Structure',
    description: 'Salary structure. Utilized where multiple structure are present (ex: Executive, Exempt, Non-Exempt, Technical, Nursing, etc.) If organization does not have multiple structures this field may be equal to organization name or code. This is a Key Field linking to the Job table',
    required: true
  }),
  grade: TextField({
    label: 'Grade',
    description: 'Salary range grade. This is a Key Field linking to the Job table',
    required: true
  }),
  structureGrade: TextField({
    label: 'Structure + Grade',
    description: 'Composite field to uniquely validate the combination of Structure and Grade',
    unique: true,
      stageVisibility: {
        mapping: false,
        review: true, 
        export: false
      }
  }),
  min: NumberField({
    label: 'Min',
    description: 'Salary range minimum. Must be annualized value'
  }),
  mid: NumberField({
    label: 'Min',
    description: 'Salary range minimum. Must be annualized value',
    required: true
  }),
  max: NumberField({
    label: 'Max',
    description: 'Salary range minimum. Must be annualized value'
  }),
  currency: OptionField({
    label: 'Currency',
    required: true,
    description: 'Currency for salary range.',
// Bug with default in OptionField, will comment out for now
    // default: "USD",
// Don't have to hardcode this whole list, can reference a table or API
    options: {
      USD: 'USD',
      GBP: 'GBP',
      EUR: 'EUR'
    }
  }),
  effectiveDate: DateField({
    label: 'Effective Date',
    description: 'Effective date of salary range'
  })
},
  {
  previewFieldKey: "structureGrade",
  // Record Hooks to add:
  // Trim all values
  // TBD:
  // Remove all zeroes - when would this be necessary?
  recordCompute: (record: any) => {
  // Create composide Structure + Grade field for linking
    const compositeKey = `${record.get('structure')} ${record.get('grade')}`
    record.set('structureGrade', compositeKey)
  // Calculate mid if not present
    // if (isNull(record.get('mid')) && record.get('min') && record.get('max')) {
    //   record.set('mid',(record.get('max') + record.get('min')) / 2)
    // }

    return record
    }

  },

)

const Jobs = new Sheet('Jobs', {
  jobCode: TextField({
    label: 'Job Code',
    required: true,
    primary: true,
    unique: true,
    description: 'Unique code for job. This is a Key Field'
  }),
  jobTitle: TextField({
    label: 'Job Title',
    required: true,
    description: 'Title for job'
  }),
  jobFamilyCode: TextField({
    label: 'Job Family Code',
    description: 'Job family code for job. Parent to Job Subfamily Code. Must be unique. Alternatively Job Function Code',
    default: 'JF ND'
  }),
  jobFamilyTitle: TextField({
    label: 'Job Family Title',
    description: 'Job family title for job. Alternatively Job Function Title',
    default: 'Not Defined'
  }),
  jobSubfamilyCode: TextField({
    label: 'Job Subfamily Code',
    description: 'Job subfamily code for job. Child to Job Family Code. Must be unique',
    default: 'SF ND'
  }),
  jobSubfamilyTitle: TextField({
    label: 'Job Subfamily Title',
    description: 'Job subfamily title for job',
    default: 'Not Defined'
  }),
  jobCategoryCode: TextField({
    label: 'Job Category Code',
    description: 'Career path/track code for job, grouping of levels. Parent to Job Level Code. Must be unique',
    default: 'All'
  }),
  jobCategoryTitle: TextField({
    label: 'Job Category Title',
    description: 'Career path/track title for job, grouping of levels. (ex: Executive, Professional, IC, Support, etc.)',
    default: 'All'
  }),
  jobLevelCode: TextField({
    label: 'Job Level Code',
    description: 'Job level code for job. Child to Job Category Code. Must be unique',
    default: 'L ND'
  }),
  jobLevelTitle: TextField({
    label: 'Job Level Title',
    description: 'Job level title for job',
    default: 'Not Defined'
  }),
  jobLevelSortOrder: NumberField({
    label: 'Job Level Sort Order',
    description: 'Used to sort job levels based on hierarchy'
  }),
  salaryStructure: TextField({
    label: 'Salary Structure',
    description: 'Salary structure job is assigned to. Distinct from Salary Group. REQUIRED if Salary Range file loading is desired'
  }),
  grade: TextField({
    label: 'Grade',
    description: 'Grade job is assigned to. REQUIRED if Salary Range file loading is desired'
  }),
  structureGrade: LinkedField({
    label: 'Structure + Grade',
    description: 'Composite field to link a combination of structure + grade to a Salary Range',
    sheet: SalaryRange,
    upsert: false,
    stageVisibility: {
      mapping: false,
      review: true, 
      export: false
    }
  }),
  flsaStatus: TextField({
    label: 'FLSA status',
    description: 'FLSA status for job'
  }),
  stiTarget: NumberField({
    label: 'STI Target %',
    description: 'Short-term incentive target % for job'
  }),
  stiEligible: BooleanField({
    label: 'STI Eligible',
    description: 'Is job eligible for short-term incentive'
  }),
  status: OptionField({
    label: 'Status',
    description: 'Please enter either "Active" or "Inactive." If left blank, the status will default to Active.',
// Bug with default in OptionField, will comment out for now
    // default: 'Active',
    options: {
      active: 'Active',
      inactive: 'Inactive'
    }
  })
},
  {
    previewFieldKey: "jobCode",
    // Record Hooks to add:
    // Trim all values
    // TBD:
    // Remove all zeroes - when would this be necessary?
    recordCompute: (record: any) => {
      const compositeKey = `${record.get('salaryStructure')} ${record.get('grade')}`
      record.set('structureGrade', compositeKey)
      return record
      }
    // Batch Record Hooks (or Sheet/Field Hooks) to add:
    // Job Level Code must always have the same Job Level Title
    // Job Family Code must always have the same Job Family Title
    // Job Sub-Family Code must always have the same Job Sub-Family Title
    // Job Sub-Family Title must always have the same Job Family Title
    }
)

const sheets = {
    Jobs,
    SalaryRange,
    // Employees
  }

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
export default new Workbook({
  name: 'Base Workbook',
  namespace: 'better-comp-base',
  sheets: sheets
})
