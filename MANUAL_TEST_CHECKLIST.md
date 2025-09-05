# Manual Test Checklist for Clika Dashboard

## Setup
- [ ] Run `yarn install` to install dependencies (including @headlessui/react)
- [ ] Run `yarn dev` to start development server
- [ ] Open http://localhost:5173 in browser

## 1. Authentication & Navigation
- [ ] Auto-login works in development mode
- [ ] User info shows in header
- [ ] All navigation links work
- [ ] Active page is highlighted

## 2. Home Page
- [ ] Stats cards show correct numbers
- [ ] Recent sessions list loads
- [ ] Top content widget displays data
- [ ] All numbers are formatted correctly

## 3. Content Management
- [ ] Content table loads
- [ ] Search works (filters results in real-time)
- [ ] Game filter works
- [ ] Status filter works
- [ ] Depth filter works
- [ ] "Add Content" button opens modal
- [ ] Game type selection shows correct form fields
- [ ] Form validation works
- [ ] Edit button opens pre-filled modal
- [ ] Delete button shows confirmation
- [ ] Results count updates with filters

## 4. Campaign Management
- [ ] Campaigns table loads
- [ ] "Create Campaign" button opens modal
- [ ] All form fields work (dates, numbers, text)
- [ ] Campaign name links show creatives
- [ ] Add creative button works
- [ ] Edit campaign works
- [ ] Delete campaign works

## 5. Analytics
- [ ] All metric cards load
- [ ] Line chart renders (Sessions Over Time)
- [ ] Pie chart renders (Game Distribution)
- [ ] Bar chart renders (Hourly Activity)
- [ ] Date range selector works
- [ ] Peak hours section shows data
- [ ] Popular games section shows percentages
- [ ] Quick stats calculate correctly

## 6. User Management
- [ ] Users table loads with all columns
- [ ] Search by name/ID works
- [ ] Role filter works
- [ ] User stats cards update
- [ ] Edit user modal works
- [ ] Invite user modal opens
- [ ] Cannot edit/delete own account

## 7. Settings
- [ ] Game Configuration tab
  - [ ] Sliders update values
  - [ ] Changes save automatically
- [ ] Feature Flags tab
  - [ ] Percentage sliders work
  - [ ] Admin-only restriction works
- [ ] System Settings tab
  - [ ] Checkboxes toggle
  - [ ] Number inputs validate
  - [ ] Save button works
- [ ] Data Export tab
  - [ ] Export buttons trigger downloads
  - [ ] CSV files contain data

## 8. UI/UX
- [ ] Dark theme is consistent
- [ ] Loading spinners appear during data fetches
- [ ] Toast notifications show for actions
- [ ] Empty states display properly
- [ ] Tables are scrollable on small screens
- [ ] Modals are accessible (can close with ESC)

## 9. Error Handling
- [ ] Network errors show toast messages
- [ ] Forms show validation errors
- [ ] Empty data shows appropriate messages

## 10. Performance
- [ ] Pages load quickly
- [ ] Search/filter is responsive
- [ ] Charts render smoothly
- [ ] No console errors

## Issues Found
1. ___________________________________
2. ___________________________________
3. ___________________________________

## Notes
_____________________________________
_____________________________________
_____________________________________