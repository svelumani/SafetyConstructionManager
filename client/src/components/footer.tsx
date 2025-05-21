export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto py-4">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-600">
            &copy; {currentYear} MySafety. All rights reserved.
          </div>
          <div className="mt-2 md:mt-0">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Service</a>
              <a href="#" className="hover:text-primary">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
