import { Flow, Solo, user } from '@a/db/schema'

import db from '@a/db/client'
import { defaultNodes } from './constant'
import { eq } from '@a/db'

const jobs: { job: string; description: string }[] = [
  {
    job: 'Accountant',
    description:
      'Manages financial records, prepares tax returns, and analyzes financial data for businesses or individuals. Ensures compliance with regulations, maintains accurate bookkeeping, and provides financial insights to support decision-making and strategic planning.'
  },
  {
    job: 'HR Manager',
    description:
      'Oversees human resources operations including recruitment, employee relations, performance management, and policy development. Manages compensation, benefits, training programs, and ensures compliance with employment laws while fostering positive workplace culture.'
  },
  {
    job: 'Pharmacist',
    description:
      'Dispenses prescription medications, provides drug information, and counsels patients on proper medication use. Reviews prescriptions for accuracy, monitors drug interactions, and collaborates with healthcare providers to optimize patient therapy outcomes.'
  },
  {
    job: 'Consultant',
    description:
      'Provides expert advice and solutions to organizations facing specific challenges or seeking improvement. Analyzes business processes, develops strategies, implements changes, and transfers knowledge to help clients achieve their goals efficiently.'
  },
  {
    job: 'Programmer',
    description:
      'Writes, tests, and maintains computer software applications using various programming languages. Develops algorithms, debugs code, collaborates with teams to create user-friendly software solutions that meet technical requirements and business objectives.'
  },
  {
    job: 'Technician',
    description:
      'Performs hands-on technical work including equipment maintenance, troubleshooting, and repair across various industries. Uses specialized tools and knowledge to ensure systems operate efficiently, following safety protocols and technical specifications.'
  },
  {
    job: 'Electrician',
    description:
      'Installs, maintains, and repairs electrical systems in residential, commercial, and industrial settings. Reads blueprints, follows electrical codes, troubleshoots problems, and ensures safe electrical operations while adhering to safety regulations.'
  },
  {
    job: 'Art Director',
    description:
      'Leads creative vision for visual projects including advertising, publications, and digital media. Manages design teams, develops concepts, coordinates with clients, and ensures artistic quality while meeting deadlines and budget requirements.'
  },
  {
    job: 'Bookkeeper',
    description:
      'Maintains accurate financial records by recording daily transactions, reconciling accounts, and preparing basic financial reports. Manages accounts payable/receivable, processes payroll, and ensures proper documentation for tax and audit purposes.'
  },
  {
    job: 'Coordinator',
    description:
      'Organizes and manages projects, events, or programs by coordinating resources, schedules, and communications. Facilitates collaboration between teams, tracks progress, handles logistics, and ensures objectives are met efficiently and on time.'
  },
  {
    job: 'Data Analyst',
    description:
      'Collects, processes, and analyzes large datasets to identify trends, patterns, and insights. Creates reports, visualizations, and recommendations to support business decisions using statistical tools and data mining techniques.'
  },
  {
    job: 'Office Manager',
    description:
      'Oversees daily office operations including administrative support, supply management, and facility coordination. Manages schedules, coordinates meetings, supervises support staff, and ensures smooth workflow while maintaining professional office environment.'
  },
  {
    job: 'Project Lead',
    description:
      'Manages project lifecycle from initiation to completion, coordinating teams, resources, and timelines. Defines scope, monitors progress, mitigates risks, communicates with stakeholders, and ensures deliverables meet quality standards and deadlines.'
  },
  {
    job: 'Sales Manager',
    description:
      'Leads sales teams to achieve revenue targets through strategic planning, client relationship management, and market analysis. Develops sales strategies, trains staff, monitors performance, and builds partnerships to drive business growth.'
  },
  {
    job: 'Web Developer',
    description:
      'Designs and builds websites and web applications using programming languages like HTML, CSS, and JavaScript. Creates user-friendly interfaces, ensures cross-browser compatibility, optimizes performance, and maintains web security standards.'
  },
  {
    job: 'System Admin',
    description:
      'Manages and maintains computer systems, networks, and servers to ensure optimal performance and security. Installs software, monitors system health, performs backups, troubleshoots issues, and implements security protocols and updates.'
  },
  {
    job: 'Product Owner',
    description:
      'Defines product vision, manages requirements, and prioritizes features based on business value and user needs. Collaborates with development teams, stakeholders, and customers to deliver products that meet market demands and strategic objectives.'
  },
  {
    job: 'Brand Manager',
    description:
      'Develops and executes brand strategies to build market presence and customer loyalty. Manages brand identity, coordinates marketing campaigns, analyzes market trends, and ensures consistent brand messaging across all channels.'
  },
  {
    job: 'Event Planner',
    description:
      'Organizes and coordinates events from concept to execution including venues, catering, entertainment, and logistics. Manages budgets, negotiates contracts, coordinates vendors, and ensures memorable experiences while meeting client expectations.'
  },
  {
    job: 'Copy Editor',
    description:
      "Reviews and refines written content for clarity, accuracy, and consistency. Corrects grammar, style, and formatting while ensuring content meets publication standards and maintains the author's voice and intended message."
  },
  {
    job: 'IT Specialist',
    description:
      'Provides technical support and maintains information technology systems including hardware, software, and networks. Troubleshoots problems, installs equipment, trains users, and ensures technology infrastructure supports organizational needs effectively.'
  },
  {
    job: 'Lab Assistant',
    description:
      'Supports laboratory operations by preparing samples, maintaining equipment, and assisting with experiments. Records data, follows safety protocols, cleans equipment, and helps researchers conduct tests and analysis in scientific environments.'
  },
  {
    job: 'Retail Manager',
    description:
      'Oversees retail store operations including sales, inventory, customer service, and staff management. Develops sales strategies, manages budgets, ensures merchandising standards, and creates positive shopping experiences to drive revenue growth.'
  },
  {
    job: 'Receptionist',
    description:
      'Serves as first point of contact for visitors and callers, providing information and directing inquiries appropriately. Manages phone systems, schedules appointments, handles mail, and maintains professional front office appearance and operations.'
  },
  {
    job: 'Veterinarian',
    description:
      'Diagnoses and treats diseases and injuries in animals, providing medical care and preventive health services. Performs surgeries, prescribes medications, educates pet owners, and promotes animal welfare through comprehensive veterinary care.'
  },
  {
    job: 'Optometrist',
    description:
      'Examines eyes and vision systems to diagnose problems and prescribe corrective lenses or treatments. Detects eye diseases, provides vision therapy, educates patients on eye health, and collaborates with other healthcare professionals.'
  },
  {
    job: 'Chiropractor',
    description:
      'Diagnoses and treats musculoskeletal disorders, particularly spine-related conditions, using manual adjustment techniques. Develops treatment plans, provides patient education, and promotes wellness through non-invasive therapeutic approaches and lifestyle recommendations.'
  },
  {
    job: 'Psychologist',
    description:
      'Assesses and treats mental health conditions through therapy, counseling, and psychological testing. Develops treatment plans, conducts research, provides crisis intervention, and helps individuals improve emotional well-being and behavioral functioning.'
  },
  {
    job: 'Social Worker',
    description:
      'Helps individuals and families navigate social services, overcome challenges, and improve quality of life. Provides counseling, advocacy, case management, and connects clients with community resources and support systems.'
  },
  {
    job: 'Firefighter',
    description:
      'Responds to emergency situations including fires, accidents, and natural disasters to protect lives and property. Provides emergency medical services, conducts rescue operations, performs fire prevention activities, and maintains equipment readiness.'
  },
  {
    job: 'Police Officer',
    description:
      'Enforces laws, maintains public safety, and protects communities through patrol, investigation, and emergency response. Conducts traffic stops, investigates crimes, writes reports, and builds community relationships to prevent criminal activity.'
  },
  {
    job: 'Security Guard',
    description:
      'Protects property, assets, and people by monitoring premises, controlling access, and responding to security incidents. Conducts patrols, operates surveillance equipment, writes incident reports, and maintains security protocols and procedures.'
  },
  {
    job: 'Warehouse Lead',
    description:
      'Supervises warehouse operations including inventory management, shipping, receiving, and staff coordination. Ensures efficient workflow, maintains safety standards, manages schedules, and optimizes storage and distribution processes for maximum productivity.'
  },
  {
    job: 'Floor Manager',
    description:
      'Oversees daily floor operations in retail, manufacturing, or service environments. Manages staff schedules, ensures quality standards, handles customer issues, monitors productivity, and maintains operational efficiency while achieving performance targets.'
  },
  {
    job: 'Shift Manager',
    description:
      'Manages operations during specific work shifts, supervising staff and ensuring smooth workflow. Handles scheduling, resolves issues, maintains quality standards, communicates with other shifts, and ensures objectives are met consistently.'
  },
  {
    job: 'Team Leader',
    description:
      'Guides and motivates team members to achieve goals through effective communication and coordination. Provides direction, delegates tasks, monitors performance, facilitates problem-solving, and ensures team cohesion and productivity in various work environments.'
  },
  {
    job: 'Supervisor',
    description:
      "Oversees employees' daily work activities, providing guidance, feedback, and support. Manages performance, ensures policy compliance, handles conflicts, coordinates with management, and maintains productive work environment while achieving departmental objectives."
  },
  {
    job: 'Statistician',
    description:
      'Collects, analyzes, and interprets data using statistical methods to solve problems and inform decisions. Designs surveys, conducts research, creates models, and presents findings to help organizations understand trends and patterns.'
  },
  {
    job: 'Underwriter',
    description:
      'Evaluates insurance applications and financial risks to determine coverage eligibility and pricing. Analyzes data, assesses risk factors, makes approval decisions, and ensures policies align with company guidelines and profitability standards.'
  },
  {
    job: 'Loan Officer',
    description:
      'Evaluates loan applications, analyzes creditworthiness, and makes lending decisions for banks or financial institutions. Reviews financial documents, interviews applicants, explains terms, and ensures compliance with lending regulations and policies.'
  },
  {
    job: 'Radiologist',
    description:
      'Interprets medical imaging studies including X-rays, CT scans, and MRIs to diagnose diseases and conditions. Collaborates with physicians, provides detailed reports, and uses advanced imaging technology to guide treatment decisions.'
  },
  {
    job: 'Pathologist',
    description:
      'Examines tissues, cells, and body fluids to diagnose diseases and determine causes of illness or death. Conducts laboratory analysis, performs autopsies, collaborates with medical teams, and provides critical diagnostic information.'
  },
  {
    job: 'Cardiologist',
    description:
      'Specializes in diagnosing and treating heart and cardiovascular system disorders. Performs procedures, interprets tests, manages chronic conditions, provides preventive care, and collaborates with healthcare teams to optimize cardiac health outcomes.'
  },
  {
    job: 'Neurologist',
    description:
      'Diagnoses and treats disorders of the nervous system including brain, spinal cord, and peripheral nerves. Manages conditions like epilepsy, stroke, and neurodegenerative diseases through comprehensive neurological care and treatment planning.'
  },
  {
    job: 'Oncologist',
    description:
      'Specializes in cancer diagnosis, treatment, and management using chemotherapy, radiation, and other therapies. Develops treatment plans, monitors patient progress, provides supportive care, and collaborates with multidisciplinary cancer care teams.'
  },
  {
    job: 'Pediatrician',
    description:
      'Provides comprehensive medical care for infants, children, and adolescents. Conducts routine checkups, administers vaccinations, diagnoses illnesses, treats injuries, and monitors growth and development while educating families about child health.'
  },
  {
    job: 'Psychiatrist',
    description:
      'Diagnoses and treats mental health disorders using medication, therapy, and other interventions. Conducts psychological assessments, develops treatment plans, provides crisis intervention, and collaborates with healthcare teams to address complex psychiatric conditions.'
  },
  {
    job: 'Landscaper',
    description:
      'Designs, installs, and maintains outdoor spaces including gardens, lawns, and hardscaping features. Plants vegetation, operates equipment, applies treatments, and creates aesthetically pleasing environments that enhance property value and functionality.'
  },
  {
    job: 'Groundskeeper',
    description:
      'Maintains outdoor areas and facilities including lawns, gardens, sports fields, and recreational spaces. Performs mowing, pruning, planting, and general upkeep while ensuring safe, attractive, and functional outdoor environments year-round.'
  },
  {
    job: 'Housekeeper',
    description:
      'Maintains cleanliness and organization in residential or commercial properties. Performs cleaning tasks, manages laundry, organizes spaces, restocks supplies, and ensures hygienic, comfortable environments while respecting privacy and property.'
  },
  {
    job: 'Instructor',
    description:
      'Teaches and educates students in specific subjects or skills through structured lessons and activities. Develops curriculum, assesses progress, provides feedback, adapts teaching methods, and creates engaging learning environments to facilitate knowledge acquisition.'
  },
  {
    job: 'Graphic Artist',
    description:
      'Creates visual designs for various media including print, digital, and multimedia projects. Develops concepts, uses design software, collaborates with clients, and produces artwork that communicates messages effectively while meeting aesthetic and functional requirements.'
  },
  {
    job: 'Quality Tester',
    description:
      'Tests products, software, or services to identify defects and ensure quality standards are met. Develops test plans, executes procedures, documents issues, collaborates with development teams, and validates fixes to deliver reliable products.'
  },
  {
    job: 'UX Designer',
    description:
      'Designs user experiences for digital products by researching user needs, creating wireframes, and testing interfaces. Focuses on usability, accessibility, and user satisfaction while collaborating with development teams to create intuitive, engaging products.'
  },
  {
    job: 'Marketing Lead',
    description:
      'Develops and executes marketing strategies to promote products or services and drive business growth. Manages campaigns, analyzes market trends, coordinates teams, measures performance, and builds brand awareness through various marketing channels.'
  },
  {
    job: 'Content Writer',
    description:
      'Creates engaging written content for websites, blogs, marketing materials, and publications. Researches topics, develops compelling narratives, optimizes for search engines, and adapts writing style to target audiences and brand voice.'
  },
  {
    job: 'Software Tester',
    description:
      'Tests software applications to identify bugs, ensure functionality, and verify performance standards. Develops test cases, executes manual and automated tests, documents defects, and collaborates with developers to improve software quality.'
  },
  {
    job: 'Database Admin',
    description:
      'Manages database systems ensuring data integrity, security, and performance optimization. Installs software, monitors systems, performs backups, manages user access, troubleshoots issues, and implements disaster recovery procedures for organizational data.'
  },
  {
    job: 'Network Admin',
    description:
      'Maintains computer networks ensuring connectivity, security, and optimal performance. Configures equipment, monitors traffic, troubleshoots issues, implements security protocols, manages user access, and updates network infrastructure to support organizational needs.'
  },
  {
    job: 'IT Support',
    description:
      'Provides technical or customer support through various channels including phone, email, and chat. Troubleshoots problems, answers questions, escalates complex issues, documents interactions, and ensures positive customer experiences and issue resolution.'
  },
  {
    job: 'Customer Rep',
    description:
      'Assists customers with inquiries, complaints, and service requests through professional communication. Processes orders, handles returns, provides product information, resolves issues, and maintains positive relationships to ensure customer satisfaction and loyalty.'
  },
  {
    job: 'Field Service',
    description:
      'Provides on-site technical support, maintenance, and repair services at customer locations. Diagnoses problems, installs equipment, performs preventive maintenance, trains users, and ensures systems operate efficiently while maintaining customer relationships.'
  },
  {
    job: 'Operations Lead',
    description:
      'Manages daily operational activities to ensure efficient workflow and goal achievement. Coordinates resources, monitors performance metrics, identifies improvement opportunities, implements processes, and leads teams to optimize productivity and quality standards.'
  },
  {
    job: 'Supply Chain',
    description:
      'Manages procurement, logistics, and distribution processes to ensure efficient flow of goods and materials. Coordinates with suppliers, monitors inventory levels, optimizes costs, and ensures timely delivery while maintaining quality standards.'
  },
  {
    job: 'Procurement',
    description:
      'Sources and purchases goods and services for organizations while ensuring quality, cost-effectiveness, and timely delivery. Negotiates contracts, manages vendor relationships, evaluates suppliers, and implements procurement strategies that support business objectives.'
  },
  {
    job: 'Risk Manager',
    description:
      'Identifies, assesses, and mitigates potential risks that could impact organizational operations or objectives. Develops risk management strategies, monitors threats, implements controls, and ensures compliance with regulatory requirements and industry standards.'
  },
  {
    job: 'Compliance',
    description:
      'Ensures organizational adherence to laws, regulations, and internal policies. Monitors compliance activities, conducts audits, develops procedures, provides training, investigates violations, and works with regulators to maintain legal and ethical standards.'
  },
  {
    job: 'Legal Counsel',
    description:
      'Provides legal advice and representation to organizations on various matters including contracts, litigation, and regulatory compliance. Drafts documents, negotiates agreements, manages legal risks, and ensures business activities comply with applicable laws.'
  },
  {
    job: 'Tax Advisor',
    description:
      'Provides expertise on tax planning, compliance, and optimization strategies for individuals or businesses. Prepares returns, advises on tax implications, represents clients with authorities, and helps minimize tax liabilities while ensuring legal compliance.'
  },
  {
    job: 'Finance Lead',
    description:
      'Manages financial operations including budgeting, forecasting, and analysis to support strategic decision-making. Oversees accounting processes, monitors performance, ensures regulatory compliance, and provides financial insights to drive business growth and profitability.'
  },
  {
    job: 'Investment Rep',
    description:
      'Provides investment advice and manages client portfolios to help achieve financial goals. Analyzes market trends, recommends strategies, executes trades, monitors performance, and maintains client relationships while ensuring regulatory compliance and fiduciary responsibility.'
  },
  {
    job: 'Real Estate',
    description:
      'Facilitates property transactions by helping clients buy, sell, or rent real estate. Markets properties, conducts showings, negotiates deals, handles paperwork, and provides market expertise while ensuring legal compliance and client satisfaction.'
  },
  {
    job: 'Property Lead',
    description:
      'Manages real estate portfolios including acquisition, development, and maintenance of properties. Oversees leasing, handles tenant relations, monitors market conditions, ensures property value optimization, and coordinates with various stakeholders and service providers.'
  },
  {
    job: 'Facility Lead',
    description:
      'Manages building operations and maintenance to ensure safe, functional, and efficient facilities. Coordinates repairs, manages vendors, oversees security systems, maintains compliance with codes, and optimizes space utilization and operational costs.'
  },
  {
    job: 'Maintenance Tech',
    description:
      'Performs preventive and corrective maintenance on equipment, machinery, and facilities. Troubleshoots problems, repairs systems, follows safety protocols, maintains records, and ensures operational reliability while minimizing downtime and maintenance costs.'
  },
  {
    job: 'Quality Lead',
    description:
      'Oversees quality assurance programs ensuring products and services meet established standards. Develops quality systems, conducts audits, analyzes metrics, implements improvements, and coordinates with teams to maintain consistent quality and customer satisfaction.'
  },
  {
    job: 'Production Lead',
    description:
      'Supervises manufacturing operations to ensure efficient production and quality output. Manages schedules, coordinates resources, monitors performance, ensures safety compliance, troubleshoots issues, and optimizes processes to meet production targets and deadlines.'
  },
  {
    job: 'Assembly Tech',
    description:
      'Assembles products or components following specifications and quality standards. Operates tools and equipment, follows safety procedures, maintains production pace, inspects work quality, and collaborates with team members to achieve manufacturing objectives.'
  },
  {
    job: 'Machine Tech',
    description:
      'Operates, maintains, and repairs industrial machinery and equipment. Monitors performance, performs adjustments, conducts preventive maintenance, troubleshoots problems, and ensures machines operate safely and efficiently to support production goals.'
  },
  {
    job: 'Safety Lead',
    description:
      'Develops and implements workplace safety programs to prevent accidents and ensure regulatory compliance. Conducts training, performs inspections, investigates incidents, maintains safety documentation, and promotes safety culture throughout the organization.'
  },
  {
    job: 'Training Lead',
    description:
      'Designs and delivers training programs to develop employee skills and knowledge. Assesses training needs, creates curricula, facilitates sessions, evaluates effectiveness, and ensures training aligns with organizational objectives and performance requirements.'
  },
  {
    job: 'Learning Lead',
    description:
      'Oversees organizational learning and development initiatives to enhance employee capabilities. Designs learning strategies, manages educational programs, evaluates outcomes, coordinates with subject matter experts, and promotes continuous learning culture.'
  },
  {
    job: 'Talent Lead',
    description:
      'Manages talent acquisition and development strategies to attract, retain, and develop skilled employees. Oversees recruitment, implements development programs, analyzes talent metrics, and ensures organizational talent needs are met effectively.'
  },
  {
    job: 'Benefits Lead',
    description:
      'Manages employee benefits programs including health insurance, retirement plans, and other compensation packages. Negotiates with vendors, communicates benefits information, ensures compliance, and optimizes programs to attract and retain talent.'
  },
  {
    job: 'Payroll Clerk',
    description:
      'Processes employee payroll ensuring accurate and timely compensation. Calculates wages, processes deductions, maintains records, handles tax withholdings, resolves discrepancies, and ensures compliance with labor laws and company policies.'
  },
  {
    job: 'Admin Assistant',
    description:
      'Provides administrative support including scheduling, correspondence, and office management. Handles phone calls, manages calendars, prepares documents, coordinates meetings, maintains files, and assists with various tasks to ensure smooth operations.'
  },
  {
    job: 'Executive Aide',
    description:
      'Provides high-level administrative support to executives including calendar management, travel coordination, and communication handling. Manages confidential information, prepares reports, coordinates meetings, and acts as liaison between executives and stakeholders.'
  },
  {
    job: 'Personal Aide',
    description:
      'Provides personal assistance to individuals with daily tasks, appointments, and activities. Offers companionship, helps with mobility, manages schedules, assists with personal care, and ensures comfort and well-being of clients.'
  },
  {
    job: 'Data Entry',
    description:
      'Inputs and updates information in computer systems and databases with accuracy and efficiency. Verifies data, maintains records, follows protocols, meets deadlines, and ensures data integrity while handling confidential information appropriately.'
  },
  {
    job: 'File Clerk',
    description:
      'Organizes and maintains physical and digital filing systems for easy retrieval and storage. Sorts documents, updates records, manages archives, assists with information requests, and ensures proper document handling and confidentiality.'
  },
  {
    job: 'Research Aide',
    description:
      'Assists researchers with data collection, analysis, and documentation. Conducts literature reviews, gathers information, maintains databases, prepares reports, and supports research projects while ensuring accuracy and adherence to research protocols.'
  },
  {
    job: 'Lab Technician',
    description:
      'Conducts laboratory tests and experiments following established procedures and safety protocols. Operates equipment, prepares samples, records results, maintains instruments, and assists scientists with research while ensuring quality and accuracy.'
  },
  {
    job: 'Medical Aide',
    description:
      'Assists healthcare professionals with patient care and clinical tasks. Takes vital signs, prepares patients, maintains medical records, schedules appointments, and provides support while ensuring patient comfort and confidentiality.'
  },
  {
    job: 'Dental Aide',
    description:
      'Assists dentists with patient care and office procedures. Prepares treatment rooms, sterilizes instruments, takes X-rays, schedules appointments, maintains records, and provides patient education while ensuring infection control and safety.'
  },
  {
    job: 'Art Therapist',
    description:
      'Uses creative arts to help individuals express emotions and improve mental health. Conducts therapy sessions, develops treatment plans, facilitates group activities, documents progress, and collaborates with healthcare teams to support healing.'
  },
  {
    job: 'Music Therapist',
    description:
      'Uses music interventions to address physical, emotional, and social needs of patients. Develops treatment plans, conducts sessions, evaluates progress, collaborates with healthcare teams, and helps improve quality of life through musical experiences.'
  },
  {
    job: 'Speech Therapist',
    description:
      'Diagnoses and treats communication and swallowing disorders in patients of all ages. Develops treatment plans, conducts therapy sessions, educates families, documents progress, and collaborates with healthcare teams to improve communication abilities.'
  },
  {
    job: 'Fitness Coach',
    description:
      'Designs and implements exercise programs to help clients achieve fitness goals. Provides instruction, motivation, and support while ensuring safety and proper technique. Monitors progress, adapts routines, and educates on healthy lifestyle choices.'
  },
  {
    job: 'Health Coach',
    description:
      'Guides individuals in making positive lifestyle changes to improve overall health and wellness. Provides education, motivation, and support for nutrition, exercise, stress management, and behavior modification while helping clients achieve sustainable health goals.'
  }
]

if (!process.argv[2]) throw new Error('Usage: bun seed-data.ts <user@email>')

const mail = String(process.argv[2]),
  u = await db.query.user.findFirst({ where: eq(user.email, mail) })

if (!u) throw new Error(`User with email ${mail} not found`)

const items = jobs.map(({ job, description }, i) => ({
  ava: String((i % 20) + 1).padStart(2, '0'),
  description,
  nodes: defaultNodes,
  title: `${job} Agent`,
  userId: u.id
}))

await db.insert(Flow).values(items)
await db.insert(Solo).values(jobs.map(({ job, description }) => ({ title: job, userId: u.id, persona: description })))

process.exit(0)
