import React from 'react';
import Button from './Button';
import { motion } from 'framer-motion';

interface Course {
  id: string;
  title: string;
  level: string;
  lessons: number;
  tags: string[];
  color: 'gblue' | 'gred' | 'gyellow' | 'ggreen';
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Introductie Vibe Coding',
    level: 'Beginner',
    lessons: 8,
    tags: ['Mindset', 'AI Tools', 'Setup'],
    color: 'gblue'
  },
  {
    id: '2',
    title: 'Cursor & Composer',
    level: 'Intermediate',
    lessons: 15,
    tags: ['Shortcuts', 'Context', 'Speed'],
    color: 'gred'
  },
  {
    id: '3',
    title: 'Bouwen zonder Code',
    level: 'Advanced',
    lessons: 20,
    tags: ['Prompting', 'Debugging', 'Logic'],
    color: 'ggreen'
  },
  {
    id: '4',
    title: 'Full Stack Vibe',
    level: 'Expert',
    lessons: 25,
    tags: ['Database', 'Auth', 'Deployment'],
    color: 'gyellow'
  }
];

const Courses: React.FC = () => {
  return (
    <section id="courses" className="py-24 px-4 bg-white dark:bg-black border-y-4 border-black dark:border-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
            <div>
                <h2 className="text-5xl md:text-7xl font-black text-black dark:text-white mb-2 uppercase">
                Het <span className="text-gblue">Curriculum</span>
                </h2>
                <div className="h-4 w-48 bg-gred skew-x-12"></div>
            </div>
            <Button variant="outline" size="lg">Bekijk Alle Tracks</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className={`
                flex flex-col h-full bg-offwhite dark:bg-gray-900 
                border-4 border-black dark:border-white 
                shadow-neo dark:shadow-neo-dark
              `}
            >
              {/* Card Header Color Block */}
              <div className={`h-4 w-full bg-${course.color} border-b-4 border-black dark:border-white`}></div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <span className={`
                    text-xs font-bold uppercase tracking-wider px-2 py-1 
                    border-2 border-black dark:border-white 
                    bg-white dark:bg-black text-black dark:text-white
                  `}>
                    {course.level}
                  </span>
                  <span className="font-mono font-bold text-gray-500">{course.lessons} Lessen</span>
                </div>
                
                <h3 className="text-2xl font-black mb-4 leading-tight dark:text-white flex-grow">
                  {course.title}
                </h3>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.tags.map(tag => (
                    <span key={tag} className="text-sm font-bold text-gray-600 dark:text-gray-400">#{tag}</span>
                  ))}
                </div>
                
                <Button 
                    className="w-full" 
                    color={course.color} 
                    size="sm"
                >
                  Start Nu
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;