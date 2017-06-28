package com.meemr.meemr;

import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.app.Fragment;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONObject;
import org.w3c.dom.Text;

/**
 * Created by stefa on 27-6-2017.
 */

public class RecentActivity extends Fragment {
    TextView results;
    ImageView imgResult;
    TextView points;

    String randompostURL = "http://10.0.2.2:3000/randompost";
    String data = "";
    RequestQueue requestQueue;

    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        return inflater.inflate(R.layout.content_recent, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        imgResult = (ImageView) getView().findViewById(R.id.memeview);
        getRequest();
        FloatingActionButton fabdown = (FloatingActionButton) getView().findViewById(R.id.fabdown);
        fabdown.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                getRequest();
            }
        });
        FloatingActionButton fabcancel = (FloatingActionButton) getView().findViewById(R.id.fabcancel);
        fabcancel.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                getRequest();
            }
        });
        FloatingActionButton fabup = (FloatingActionButton) getView().findViewById(R.id.fabup);
        fabup.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                getRequest();
            }
        });
        imgResult.setOnTouchListener(new OnSwipeTouchListener(getActivity()) {
            public void onSwipeTop() {
            }
            public void onSwipeRight() {
                Snackbar.make(getView().findViewById(R.id.memeview), "Upvoted", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
                getRequest();
            }
            public void onSwipeLeft() {
                Snackbar.make(getView().findViewById(R.id.memeview), "Downvoted", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
                getRequest();
            }
            public void onSwipeBottom() {
                Snackbar.make(getView().findViewById(R.id.memeview), "Crippling depression", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }

        });
    }

    public void getRequest(){
        // Creates the Volley request queue
        requestQueue = Volley.newRequestQueue(getActivity());

        // Casts results into the TextView found within the main layout XML with id jsonData
        results = (TextView) getView().findViewById(R.id.text);
        imgResult = (ImageView) getView().findViewById(R.id.memeview);
        points = (TextView) getView().findViewById(R.id.pointLabel);


        // Creating the JsonArrayRequest class called arrayreq, passing the required parameters
        //JsonURL is the URL to be fetched from
        JsonObjectRequest jsObjRequest = new JsonObjectRequest
                (Request.Method.GET, randompostURL, null, new Response.Listener<JSONObject>() {

                    @Override
                    public void onResponse(JSONObject response) {
                        try{
                            results.setText("Response: " + response.toString());
                            results.setText(response.getString("title"));
                            int upvotes = Integer.parseInt(response.getString("upvotes"));
                            int downvotes = Integer.parseInt(response.getString("downvotes"));
                            points.setText(upvotes-downvotes + " Points");
                            System.out.println("WE DEDEN IETS!");
                            Animation myFadeInAnimation = AnimationUtils.loadAnimation(getActivity().getApplicationContext(), R.anim.fadein);
                            imgResult.startAnimation(myFadeInAnimation); //Set animation to your ImageView
                            new DownloadImageTask((ImageView) getView().findViewById(R.id.memeview))
                                    .execute("http://10.0.2.2:3000/img/"+response.getString("id"));


                        } catch(Exception ex){
                            ex.printStackTrace();
                        }

                    }
                }, new Response.ErrorListener() {

                    @Override
                    public void onErrorResponse(VolleyError error) {
                        System.out.println(error);

                    }
                });
        // Adds the JSON array request "arrayreq" to the request queue
        requestQueue.add(jsObjRequest);
    }
}
