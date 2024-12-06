class stringConst {
  Admin = 'admin';
  User = 'user';
  checker = 'checker';
  maker = 'maker';
}

export const string = new stringConst();
class status {
  Pending = 'pending';
  Tally = 'awaiting_tally_approval';
  Approved = 'approved';
  Rejected = 'rejected';
  Paid = 'paid';
}

export const approval = new status();