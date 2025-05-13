const pool = require('../config/db');

const ProjectService = {
  getProjectsWithParticipants: async () => {
    const [projects] = await pool.query(`
      SELECT p.*, 
        GROUP_CONCAT(CONCAT(s.student_id, ' (', s.name, ')') SEPARATOR ', ') AS participants
      FROM projects p
      LEFT JOIN project_participants pp ON p.project_id = pp.project_id
      LEFT JOIN students s ON pp.user_id = s.student_id
      GROUP BY p.project_id
    `);
    return projects;
  },

  createProject: async (projectData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 插入项目
      await connection.query(
        'INSERT INTO projects SET ?',
        [{
          project_id: projectData.projectId,
          name: projectData.projectName,
          description: projectData.description,
          hour_payment: projectData.hourPayment,
          budget: projectData.budget,
          leading_professor: projectData.leadingProfessor,
          type: 'ADMIN'
        }]
      );

      // 插入参与者
      const participantValues = projectData.participants.map(id => [
        projectData.projectId,
        id,
        'STUDENT'
      ]);
      
      await connection.query(
        'INSERT INTO project_participants (project_id, user_id, role) VALUES ?',
        [participantValues]
      );

      await connection.commit();
      return { success: true };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = ProjectService; 