# League Scheduler Management Tool

A comprehensive, professional-grade league management system for organizing sports leagues, tournaments, and competitions. Create dynamic league pages with clean URLs, manage teams, generate schedules, and export data - all in one powerful tool.

## 🏆 Features

### Core Functionality
- **League Configuration**: Set up leagues with custom sports, schedules, and parameters
- **Team Management**: Add teams with contact information and custom fields
- **Schedule Generation**: Create round-robin, elimination, or custom tournament schedules
- **Dynamic League Pages**: Generate professional league portals with clean URLs (e.g., `/2025kccbocce`)
- **Multi-League Support**: Manage multiple leagues simultaneously
- **Data Export**: Export schedules as CSV, JSON, or print-ready formats

### Professional League Portals
- **Modern UI**: Gradient backgrounds with glass-morphism effects
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Interactive Features**: Search, filter, and real-time updates
- **Tabbed Navigation**: Overview, Teams, Schedule, and Standings sections
- **Floating Actions**: Quick access to refresh, share, and download functions

### Advanced Features
- **Custom Parameters**: Add league-specific rules and settings
- **Venue Management**: Support for multiple courts/venues
- **Game Day Selection**: Choose specific days of the week for matches
- **Share & Collaborate**: Generate shareable links and export capabilities
- **Data Persistence**: All data saved locally with ability to reload leagues

## 🚀 Quick Start

### Installation
1. Clone this repository to your local machine or web server
2. No additional dependencies required - it's a standalone HTML file!

```bash
git clone [your-repo-url]
cd [your-repo-name]
git checkout dev
```

### Usage
1. Open `league_scheduler_tool.html` in your web browser
2. Configure your league settings in the Setup section
3. Add teams in the Teams section
4. Generate schedules in the Schedule section
5. Create a professional league page with the "Create League Page" button
6. Export and share your league data

## 📖 Detailed Guide

### 1. League Setup
Configure the basic parameters for your league:

- **League Name**: This will be used to generate the URL slug
- **Sport/Activity**: Choose from predefined sports or create custom
- **Season Dates**: Set start and end dates for your league
- **Team Configuration**: Number of teams and players per team
- **Schedule Type**: 
  - Round Robin (everyone plays everyone)
  - Double Round Robin (play each team twice)
  - Single/Double Elimination tournaments
  - Custom number of rounds
- **Game Settings**: Match duration, break times, start times
- **Game Days**: Select specific days of the week for matches
- **Venues**: Configure number of courts/venues available
- **Custom Parameters**: Add league-specific rules and settings

### 2. Team Management
Add and manage teams participating in your league:

- **Team Information**: Name, contact person, email, phone
- **Roster Details**: Number of players (if configured)
- **Bulk Generation**: Create sample teams for testing
- **Team Validation**: Ensures team limits are respected

### 3. Schedule Generation
Create comprehensive match schedules:

- **Automatic Scheduling**: Based on league type and configuration
- **Venue Assignment**: Distributes matches across available venues
- **Date Calculation**: Respects selected game days and start dates
- **Conflict Avoidance**: Ensures no team plays multiple matches simultaneously

### 4. League Page Creation
Generate professional league portals:

- **Clean URLs**: Automatic slug generation from league names
- **Professional Design**: Modern, responsive interface
- **Multiple Sections**: Overview, teams, schedule, and standings
- **Interactive Features**: Search, filter, and sorting capabilities
- **Real-time Updates**: Refresh data without page reload

### 5. Data Management
Comprehensive data handling:

- **Local Storage**: All data persists between sessions
- **Multiple Leagues**: Manage several leagues simultaneously
- **Import/Export**: CSV and JSON export capabilities
- **Print Support**: Generate print-ready schedules
- **Share Links**: Create shareable URLs for league access

## 🛠 Technical Details

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile Support**: iOS Safari, Chrome Mobile, Samsung Internet
- **No Server Required**: Runs entirely in the browser

### Data Storage
- **Local Storage**: All league data stored in browser's localStorage
- **Data Format**: JSON structure for easy import/export
- **Privacy**: No data sent to external servers

### File Structure
```
league_scheduler_tool.html    # Main application file
README.md                     # This documentation
assets/
├── styles.css               # Separated CSS (optional)
└── scripts.js               # Separated JavaScript (optional)
```

## 🎨 Customization

### Styling
The tool uses a modern design system with:
- **Color Scheme**: Professional blue/purple gradients
- **Typography**: System fonts for optimal readability
- **Responsive Grid**: Flexbox and CSS Grid for layouts
- **Animations**: Smooth transitions and micro-interactions

### Custom Sports
Add your own sports/activities:
1. Select "Custom Sport" in the sport dropdown
2. Enter your custom sport name
3. Configure sport-specific parameters

### League Parameters
Customize leagues with specific rules:
- Maximum substitutions
- Time limits
- Scoring systems
- Equipment requirements
- Weather policies

## 📱 Mobile Experience

The tool is fully responsive and optimized for mobile devices:
- **Touch-Friendly**: Large buttons and touch targets
- **Mobile Navigation**: Collapsible sidebar with overlay
- **Optimized Forms**: Mobile-friendly input fields
- **Swipe Gestures**: Intuitive navigation between sections

## 🔧 Advanced Configuration

### URL Structure
League pages use clean URLs based on league names:
- Original: "2025 KCC Bocce League"
- Generated URL: `/2025kccbocce`
- Special characters removed and spaces eliminated

### Export Formats

#### CSV Export
- Match schedules with all details
- Team rosters and contact information
- Compatible with Excel and Google Sheets

#### JSON Export
- Complete league data structure
- Suitable for backup and migration
- Can be imported into other systems

#### Print Format
- Clean, professional layout
- Optimized for standard paper sizes
- Includes all essential match information

## 🚨 Troubleshooting

### Common Issues

**League page not loading**
- Ensure league configuration is saved
- Check browser's localStorage is enabled
- Verify league name doesn't contain special characters

**Schedule generation fails**
- Confirm at least 2 teams are added
- Check that season start date is set
- Verify venue configuration is complete

**Export not working**
- Ensure schedule is generated before exporting
- Check browser permissions for file downloads
- Try a different export format

**Mobile display issues**
- Clear browser cache
- Ensure latest browser version
- Check screen orientation (portrait recommended)

### Browser Requirements
- **JavaScript**: Must be enabled
- **Local Storage**: Required for data persistence
- **Modern CSS**: CSS Grid and Flexbox support needed

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across browsers
5. Submit a pull request

### Code Style
- Use consistent indentation (2 spaces)
- Comment complex functions
- Follow semantic HTML practices
- Maintain responsive design principles

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙋‍♂️ Support

### Getting Help
- **Issues**: Report bugs via GitHub Issues
- **Documentation**: Refer to this README for guidance
- **Community**: Join discussions in GitHub Discussions

### Feature Requests
We welcome suggestions for new features! Please:
1. Check existing issues first
2. Provide detailed use cases
3. Consider implementation complexity
4. Submit via GitHub Issues with "enhancement" label

## 🎯 Roadmap

### Upcoming Features
- **Real-time Collaboration**: Multiple users editing leagues
- **Advanced Statistics**: Team performance analytics
- **Calendar Integration**: Export to Google Calendar, Outlook
- **Notification System**: Email/SMS reminders for matches
- **Tournament Brackets**: Visual bracket displays
- **Score Tracking**: Live score updates and results
- **Player Management**: Individual player statistics
- **League Templates**: Predefined configurations for common sports

### Version History
- **v1.0**: Initial release with core functionality
- **v1.1**: Added dynamic league page generation
- **v1.2**: Enhanced mobile experience and multi-league support
- **v1.3**: Advanced export features and sharing capabilities

---

**Built with ❤️ for sports organizers everywhere**

Create professional leagues in minutes, not hours. From local community sports to competitive tournaments, this tool scales to meet your needs.
