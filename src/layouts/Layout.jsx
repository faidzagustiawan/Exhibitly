import { Outlet } from 'react-router-dom'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { motion } from 'framer-motion'

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background-primary dark:bg-background-primary">
      <Header />
      <motion.main 
        className="grow"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  )
}

export default Layout