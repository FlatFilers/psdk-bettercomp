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
import { isNull, trim } from 'lodash'

/**
 * Sheets
 * Define your Sheet configuration and Fields here, or import them:
 * import { YourSheet } from './path-to-your-sheet/your-sheet.ts'
 */


const SalaryRange = new Sheet('SalaryRange', {
  salaryGroup: TextField({
    label: 'Salary Group',
    required: true,
    compute: (value) => value.trim(),
    description: 'Salary range group. Used when there are multiple min-mid-max values or currencies associated with a single structure + grade combination. Commonly seen for premium or discounted range variations as well as location differentiators for geographically disparate ranges, including global versioning.'
  }),
// Quick note on these two. I'm not sure if they're independently unique, or the combination of the two is unique? If so, I might create a composite field
// in this dataset for the uniqueness check, as well as a composite field in the Jobs dataset to create a link
  structure: TextField({
    label: 'Structure',
    description: 'Salary structure. Utilized where multiple structure are present (ex: Executive, Exempt, Non-Exempt, Technical, Nursing, etc.) If organization does not have multiple structures this field may be equal to organization name or code. This is a Key Field linking to the Job table',
    required: true,
    compute: (value) => value.trim()
  }),
  grade: TextField({
    label: 'Grade',
    description: 'Salary range grade. This is a Key Field linking to the Job table',
    required: true,
    compute: (value) => value.trim()
  }),
  structureGrade: TextField({
    label: 'Structure + Grade',
    description: 'Composite field to uniquely validate the combination of Structure and Grade',
    unique: true,
    compute: (value) => value.trim(),
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
    label: 'Mid',
    description: 'Salary range median. Must be annualized value',
    required: true
  }),
  max: NumberField({
    label: 'Max',
    description: 'Salary range minimum. Must be annualized value'
  }),
  currency: OptionField({
    label: 'Currency',
    required: true,
    compute: (value) => value.trim(),
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
  // Remove all zeroes - when would this be necessary?
  recordCompute: (record: any) => {

  // Create composide Structure + Grade field for linking
    const compositeKey = `${record.get('structure')} ${record.get('grade')}`
    record.set('structureGrade', compositeKey)

  // Calculate mid if not present 
    const min = record.get('min')
    const max = record.get('max')
    const mid = record.get('mid')
    if (min.isNull() && max && mid) {
      const calculatedMid = (min + max) / 2
      record.set('mid',calculatedMid)
    }
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
    compute: (value) => value.trim(),
    description: 'Unique code for job. This is a Key Field'
  }),
  jobTitle: TextField({
    label: 'Job Title',
    required: true,
    compute: (value) => value.trim(),
    description: 'Title for job'
  }),
  jobFamilyCode: TextField({
    label: 'Job Family Code',
    compute: (value) => value.trim(),
    description: 'Job family code for job. Parent to Job Subfamily Code. Must be unique. Alternatively Job Function Code',
    default: 'JF ND'
  }),
  jobFamilyTitle: TextField({
    label: 'Job Family Title',
    compute: (value) => value.trim(),
    description: 'Job family title for job. Alternatively Job Function Title',
    default: 'Not Defined'
  }),
  jobSubfamilyCode: TextField({
    label: 'Job Subfamily Code',
    compute: (value) => value.trim(),
    description: 'Job subfamily code for job. Child to Job Family Code. Must be unique',
    default: 'SF ND'
  }),
  jobSubfamilyTitle: TextField({
    label: 'Job Subfamily Title',
    compute: (value) => value.trim(),
    description: 'Job subfamily title for job',
    default: 'Not Defined'
  }),
  jobCategoryCode: TextField({
    label: 'Job Category Code',
    compute: (value) => value.trim(),
    description: 'Career path/track code for job, grouping of levels. Parent to Job Level Code. Must be unique',
    default: 'All'
  }),
  jobCategoryTitle: TextField({
    label: 'Job Category Title',
    compute: (value) => value.trim(),
    description: 'Career path/track title for job, grouping of levels. (ex: Executive, Professional, IC, Support, etc.)',
    default: 'All'
  }),
  jobLevelCode: TextField({
    label: 'Job Level Code',
    compute: (value) => value.trim(),
    description: 'Job level code for job. Child to Job Category Code. Must be unique',
    default: 'L ND'
  }),
  jobLevelTitle: TextField({
    label: 'Job Level Title',
    compute: (value) => value.trim(),
    description: 'Job level title for job',
    default: 'Not Defined'
  }),
  jobLevelSortOrder: NumberField({
    label: 'Job Level Sort Order',
    description: 'Used to sort job levels based on hierarchy'
  }),
  salaryStructure: TextField({
    label: 'Salary Structure',
    compute: (value) => value.trim(),
    description: 'Salary structure job is assigned to. Distinct from Salary Group. REQUIRED if Salary Range file loading is desired'
  }),
  grade: TextField({
    label: 'Grade',
    compute: (value) => value.trim(),
    description: 'Grade job is assigned to. REQUIRED if Salary Range file loading is desired'
  }),
  structureGrade: LinkedField({
    label: 'Structure + Grade',
    compute: (value) => value.trim(),
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
    compute: (value) => value.trim(),
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
    compute: (value) => value.trim(),
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

const Employees = new Sheet('Employees', {
  employeeID: TextField({
    label: 'Employee ID',
    required: true,
    primary: true,
    unique: true,
    compute: (value) => value.trim(),
    description: 'Unique code for employee. This is a Key Field'
  }),
  firstName: TextField({
    label: 'First',
    compute: (value) => value.trim(),
    description: "Employee's first name"
  }),
  lastName: TextField({
    label: 'Last Name',
    compute: (value) => value.trim(),
    description: "Employee's last name"
  }),
  employeeName: TextField({
    label: 'Employee Name',
    compute: (value) => value.trim(),
    description: "Employee's full name"
  }),
  jobCode: LinkedField({
    label: 'Job Code',
    compute: (value) => value.trim(),
    description: "Employee's job code. This is the Key Field linking to the Job table",
    sheet: Jobs,
    upsert: false,
    stageVisibility: {
      mapping: false,
      review: true, 
      export: false
    }
  }),
  // This field should get populated based on a lookup from the Jobs table
  // jobTitle: TextField({
  //   label: 'Job Title',
  //   description: 'Job title based on job code'
  // }),
  baseSalary: NumberField({
    label: 'Base Salary',
    description: "Employee's annualized base salary. Must be annualized based on 1 FTE"
  })
},
{
  previewFieldKey: "employeeID",
  // Record Hooks to add:
  // 
  recordCompute: (record: any) => {

    return record
    }

  },

) 

const sheets = {
    Jobs,
    SalaryRange,
    Employees
  }

// Workbook  - Update to reference your Workbook with Sheet(s) and Portal(s)
export default new Workbook({
  name: 'Base Workbook',
  namespace: 'better-comp-base',
  sheets: sheets
})
