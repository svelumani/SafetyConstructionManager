// Temporary file to add to routes.ts
const startInspectionEndpoint = `
  // Endpoint to start an inspection
  app.put('/api/inspections/:id/start', requireAuth, async (req, res) => {
    const inspectionId = parseInt(req.params.id);
    
    try {
      // Check if inspection exists and belongs to user's tenant
      const [inspection] = await db.select().from(schema.inspections)
        .where(eq(schema.inspections.id, inspectionId))
        .where(eq(schema.inspections.tenantId, req.user.tenantId));
      
      if (!inspection) {
        return res.status(404).json({ message: 'Inspection not found' });
      }
      
      // Check if inspection is in a valid state to start
      if (inspection.status !== 'pending' && inspection.status !== 'scheduled') {
        return res.status(400).json({ 
          message: 'Only pending or scheduled inspections can be started'
        });
      }
      
      // Update inspection status to in_progress
      const [updatedInspection] = await db
        .update(schema.inspections)
        .set({ 
          status: 'in_progress',
          startedAt: new Date()
        })
        .where(eq(schema.inspections.id, inspectionId))
        .returning();
      
      // Create system log
      await storage.createSystemLog({
        tenantId: req.user.tenantId,
        userId: req.user.id,
        action: 'inspection_started',
        entityType: 'inspection',
        entityId: inspectionId.toString(),
        details: { title: inspection.title }
      });
      
      // Return the updated inspection
      res.json(updatedInspection);
    } catch (err) {
      console.error('Error starting inspection:', err);
      res.status(500).json({ message: 'Failed to start inspection' });
    }
  });
`;