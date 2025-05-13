const pool = require('../config/db');

module.exports = {
  getProjectStudents: async (projectId) => {
    const [students] = await pool.query(`
      SELECT s.student_id, s.name, ps.score
      FROM performance_scores ps
      JOIN students s ON ps.student_id = s.student_id
      WHERE ps.project_id = ?
    `, [projectId]);
    return students;
  },

  approveHours: async (projectId, studentId, hours) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      // 先查询hour_payment
      const [[{ hour_payment }]] = await connection.query(
        'SELECT hour_payment FROM projects WHERE project_id = ?',
        [projectId]
      );

      // 计算总金额
      const total = hours * hour_payment;

      await connection.query(
        'UPDATE wage_history SET status = "APPROVED" WHERE project_id = ? AND student_id = ?',
        [projectId, studentId]
      );

      await connection.query(
        'UPDATE projects SET budget = budget - ? WHERE project_id = ?',
        [total, projectId]
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