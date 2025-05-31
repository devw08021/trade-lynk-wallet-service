import { adminService } from '../services/admin.service';

export class AdminController {
  async withdrawAccept(c) {
    const adminId = c.get('userId'); // Should be admin
    const { txId, approve, reason, userId, symbol, amount, address } = await c.req.json();
    if (approve) {
      const result = await adminService.approveWithdrawal(txId, userId, symbol, amount, address);
      return c.json({ status: 'approved', txId });
    } else {
      const result = await adminService.rejectWithdrawal(txId, reason);
      return c.json({ status: 'rejected', txId, reason });
    }
  }
} 