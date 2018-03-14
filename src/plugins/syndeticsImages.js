export default ({ Vue }) => {
  /**
   * Returns an image url given isbn, upc or oclc
   *
   * @param integer $size
   *   int 0, 1, 2 to request small, med, or lg thumbnail
   * @param string $isbn
   * @param string $upc
   * @param string $oclc
   *
   */
  Vue.prototype.$getSyndeticsImage = function (size, isbn, upc, oclc) {
    // Set size identifier string
    let thumbSize;
    switch (size) {
      case 0:
        thumbSize = 'SC.GIF';
        break;
      case 1:
        thumbSize = 'MC.GIF';
        break;
      case 2:
        thumbSize = 'LC.JPG';
        break;
      default:
        thumbSize = 'MC.GIF';
    }

    this.trimISBN = function (input) {
      return input + ''.trim();
    };

    // Clean up ids before querying syndetics
    isbn = this.trimISBN(isbn);
    upc = this.trimISBN(upc);
    oclc = this.trimISBN(oclc);

    // Generate & return thumbnail link
    return `https://covers.midcolumbialibraries.org/covers.php?path=https://syndetics.com/index.aspx?isbn=${isbn}/${thumbSize}&client=mcolu&upc=${upc}&oclc=${oclc}`;
  };
};
