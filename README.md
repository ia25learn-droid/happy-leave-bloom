# Leave Manager 🌈

A joyful, cheerful, and delightful leave management system designed to spread happiness while managing team time-off requests.

![Leave Manager](public/og-image.png)

## ✨ Features

### For All Staff
- **Apply for Leave** - Submit leave requests with multiple leave types
- **Personal Dashboard** - View leave history, team strength, and quick actions
- **Team Calendar** - See approved leaves with color-coded types and Malaysian public holidays
- **Leave Cancellation** - Cancel submitted leave requests anytime

### For Approvers
- **Approve/Reject Requests** - Review and manage pending leave requests
- **Self-Approval** - Approvers can self-approve their own leave
- **Block Periods** - Set periods where leave cannot be requested
- **Backup Notes** - View backup plans for long leave requests (4+ days)

### For Admins
- **User Management** - Manage users and change roles
- **Password Reset** - Generate password reset links for users
- **Block Periods** - Configure restricted leave periods
- **System Overview** - Full visibility of all leave activities

## 🎨 Leave Types

| Type | Color |
|------|-------|
| Annual Leave | Soft Sky Blue |
| Half Day AM | Gentle Sunrise Yellow |
| Half Day PM | Warm Sunset Orange |
| Sick Leave | Caring Rose Pink |
| Training Leave | Growth Purple |
| Maternity Leave | Nurturing Mint Green |
| Paternity Leave | Warm Beige/Tan |

## 🗓️ Malaysian Public Holidays 2025

The calendar automatically displays Malaysian public holidays including:
- New Year's Day, Federal Territory Day
- Thaipusam, Chinese New Year
- Nuzul Al-Quran, Hari Raya Aidilfitri
- Labour Day, Wesak Day
- Hari Raya Haji, Awal Muharram
- Merdeka Day, Malaysia Day
- Prophet Muhammad's Birthday
- Deepavali, Christmas Day

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Authentication**: Email/Password with role-based access
- **Database**: PostgreSQL with Row Level Security

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd leave-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| **Staff** | Submit leave, view personal history, view team calendar |
| **Approver** | All staff capabilities + approve/reject requests, set block periods, self-approve own leave |
| **Admin** | All staff capabilities + manage users, change roles, set block periods, generate password reset links |

## 📊 Team Strength Indicators

- 🟢 **8-10 available**: Team at full power! ⚡
- 🟡 **6-7 available**: Good coverage today! 👍
- 🟠 **4-5 available**: Running lean but we've got this! 💪
- 🔴 **3 or fewer**: Small but mighty crew today! 🚨

## 📋 Notes

- **Approval Queue**: In the approval sheet, requests are sorted with the earliest submissions at the top (first-come, first-served order)

## 🔒 Constraints

- Maximum 10 user accounts
- Duplicate leave prevention for same dates
- Block periods restrict leave submissions
- Capacity alerts when 2+ teammates are away

## 🌐 Deployment

**Production URL**: https://leave-manager.netlify.app/

### Deploy with Lovable
1. Open your [Lovable Project](https://lovable.dev/projects/bb4ac051-2870-4c2b-85be-9b42e08bedd4)
2. Click Share → Publish

### Deploy with Netlify
The project is configured for Netlify deployment with the `public/_redirects` file for SPA routing.

## 📝 License

This project is private and proprietary.

## 💖 Design Philosophy

This leave management system is designed to be a "happiness-spreading, work-life-balance-celebrating masterpiece" with:
- Soft pastel colors (cotton candy and spring flowers)
- Rounded corners everywhere
- Smooth animations and micro-interactions
- Friendly, encouraging messages
- No harsh blacks or aggressive reds

---

Built with 💛 using [Lovable](https://lovable.dev)
