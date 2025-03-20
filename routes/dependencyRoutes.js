const express = require("express");
const router = express.Router();
const {
  addDependency,
  removeDependency,
  getAllDependencies,
} = require("../controllers/dependencyController");

/**
 * @swagger
 * /api/dependencies/{taskId}:
 *   post:
 *     summary: Add a dependency to a task
 *     description: Makes a task depend on another task
 *     tags: [Dependencies]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task that will depend on another task
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dependencyId
 *             properties:
 *               dependencyId:
 *                 type: string
 *                 description: ID of the task that will be a dependency
 *     responses:
 *       200:
 *         description: Dependency added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *       400:
 *         description: Bad request - dependency already exists or would create a circular reference
 *       404:
 *         description: Task or dependency not found
 */
router.post("/:taskId", addDependency);

/**
 * @swagger
 * /api/dependencies/{taskId}/dependency/{dependencyId}:
 *   delete:
 *     summary: Remove a dependency from a task
 *     description: Removes the dependency relationship between two tasks
 *     tags: [Dependencies]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task that has the dependency
 *       - in: path
 *         name: dependencyId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the dependency task to remove
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dependencyId
 *             properties:
 *               dependencyId:
 *                 type: string
 *                 description: ID of the task that will be a dependency
 *     responses:
 *       200:
 *         description: Dependency removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     dependencies:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Bad request - dependency does not exist
 *       404:
 *         description: Task not found
 */
router.delete("/:taskId/dependency/:dependencyId", removeDependency);

/**
 * @swagger
 * /api/dependencies/{taskId}:
 *   get:
 *     summary: Get all dependencies for a task
 *     description: Retrieves both direct and indirect (transitive) dependencies for a task
 *     tags: [Dependencies]
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the task to get dependencies for
 *     responses:
 *       200:
 *         description: List of dependencies retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     task:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         title:
 *                           type: string
 *                     directDependencies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           status:
 *                             type: string
 *                     allDependencies:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           status:
 *                             type: string
 *       404:
 *         description: Task not found
 */
router.get("/:taskId", getAllDependencies);

module.exports = router;
