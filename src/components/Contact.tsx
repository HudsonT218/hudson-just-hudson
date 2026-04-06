const Contact = () => {
  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Ready to Build Something?
        </h2>
        <p className="text-gray-500 mb-8">
          Let's hop on a quick call and figure out how I can help. No pressure, no pitch — just a
          conversation about what you need.
        </p>
        <a
          href="https://calendly.com/hudsonturansky"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-sm hover:shadow-md"
        >
          Book a Call
        </a>
      </div>
    </section>
  );
};

export default Contact;
