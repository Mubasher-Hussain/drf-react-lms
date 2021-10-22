import React from "react";

// Title and summary field for creating or editing a book
export class BookFormat extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = {
      bookData: {
        cover: null,
        title: '',
        summary: '',
        author: '',
        published_on: '',
        category: '',
        quantity: 0,
      },
    };  
  }
  
  componentDidMount(){
    if (this.props.bookData){
      let newdata = this.props.bookData;
      this.setState({
        bookData: newdata,
      })
    }
  }
  
  handleInputChange(event) {
    let bookData=this.state.bookData;
    if(event.target.name == 'cover')
      bookData[event.target.name] = event.target.files[0];
    else    
      bookData[event.target.name] = event.target.value;
    this.setState({
      bookData: bookData
    });
  }
  
  render(){
    return (
      <div className="container">
        <div class="form-group" >
          <label style= {{float: 'left'}} htmlFor="cover">Cover Photo</label>
          <input type="file"
            class="form-control"
            name="cover"
            placeholder="Cover Photo"
            onChange={this.handleInputChange.bind(this)}
            accept="image/png, image/jpeg"
            style={{fontSize: '16px'}}
          />
        </div>
        <div class="form-group" >
          <label style= {{float: 'left'}} htmlFor="title">Title</label>
          <input type="text"
            class="form-control"
            name="title"
            placeholder="Title"
            value={this.state.bookData.title}
            onChange={this.handleInputChange.bind(this)}
            style={{fontSize: '16px'}}
          />
        </div>
        <div class="form-group" >
          <label style= {{float: 'left'}} htmlFor="author">Author</label>
          <input type="text"
            class="form-control"
            name="author"
            placeholder="Author"
            value={this.state.bookData.author}
            onChange={this.handleInputChange.bind(this)}
            style={{fontSize: '16px'}}
          />
        </div>
        <div class="form-group" >
          <label style= {{float: 'left'}} htmlFor="category">Category</label>
          <input type="text"
            class="form-control"
            name="category"
            placeholder="Category"
            value={this.state.bookData.category}
            onChange={this.handleInputChange.bind(this)}
            style={{fontSize: '16px'}}
          />
        </div>
        <div class="form-group" >
          <label style= {{float: 'left'}} htmlFor="quantity">Quantity</label>
          <input type="number"
            step="1"
            class="form-control"
            name="quantity"
            placeholder="Quantity"
            value={this.state.bookData.quantity}
            onChange={this.handleInputChange.bind(this)}
            style={{fontSize: '16px'}}
          />
        </div>
        <label style= {{float: 'left'}} htmlFor="published_on">Publish Date:</label>
        <input
          type="date"
          class="form-control"
          name="published_on"
          value={this.state.bookData.published_on}
          onChange={this.handleInputChange.bind(this)}
        />
        <div class="form-group">
          <label style= {{float: 'left'}} htmlFor="summary">Summary</label>
          <textarea
            class="form-control"
            name="summary"
            placeholder="Summary"
            value={this.state.bookData.summary}
            onChange={this.handleInputChange.bind(this)}
            style={{minHeight: '200px', fontSize: '16px'}}
           />
        </div>
        <button type="button" className="btn" onClick={() => this.props.handleClick(this.state.bookData)}>
        Submit
        </button>
      </div>
    );
  }
}

