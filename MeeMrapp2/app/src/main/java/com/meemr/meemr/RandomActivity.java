package com.meemr.meemr;

import android.os.Bundle;
import android.support.annotation.Nullable;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.ImageView;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.VolleyLog;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;

import static com.meemr.meemr.R.drawable.ic_cancel_black_24dp;
import static com.meemr.meemr.R.drawable.ic_refresh_black_24dp;

/**
 * Created by stefa on 27-6-2017.
 */

public class RandomActivity extends Fragment {
    TextView results;
    ImageView imgResult;
    TextView points;
    FloatingActionButton downvoteButton;
    FloatingActionButton upvoteButton;
    FloatingActionButton nextButton;
    String token = "";
    String type = "recent";
    String direction = "false";

    String data = "";
    RequestQueue requestQueue;
    String postId;


    @Nullable
    @Override
    public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container, Bundle savedInstanceState) {
        //token = ((MainActivity) getActivity()).getToken();
        return inflater.inflate(R.layout.content_recent, container, false);
    }

    @Override
    public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {

        super.onViewCreated(view, savedInstanceState);
        Snackbar.make(getView().findViewById(R.id.memeview), "When logged in, swipe left to downvote, right to upvote", Snackbar.LENGTH_LONG)
                .setAction("Action", null).show();
        downvoteButton = (FloatingActionButton) getView().findViewById(R.id.fabdown);
        upvoteButton= (FloatingActionButton) getView().findViewById(R.id.fabup);
        nextButton = (FloatingActionButton) getView().findViewById(R.id.fabcancel);
        if(!((MainActivity) getActivity()).isLoggedin()){
            downvoteButton.setVisibility(View.INVISIBLE);
            upvoteButton.setVisibility(View.INVISIBLE);
            nextButton.setImageResource(ic_refresh_black_24dp);
        } else{
            downvoteButton.setVisibility(View.VISIBLE);
            upvoteButton.setVisibility(View.VISIBLE);
            nextButton.setImageResource(ic_cancel_black_24dp);
        }
        getActivity().getWindow().setSoftInputMode(
                WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN
        );
        imgResult = (ImageView) getView().findViewById(R.id.memeview);
        downvoteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                vote("0");
                getRequest();
            }
        });
        nextButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                getRequest();
            }
        });
        upvoteButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                vote("1");
                getRequest();
            }
        });
        imgResult.setOnTouchListener(new OnSwipeTouchListener(getActivity()) {
            public void onSwipeTop() {
                direction = "true";
            }
            public void onSwipeRight() {
                if(((MainActivity) getActivity()).isLoggedin()) {
                    Snackbar.make(getView().findViewById(R.id.memeview), "Upvoted", Snackbar.LENGTH_LONG)
                            .setAction("Action", null).show();
                }
                vote("1");
                getRequest();
            }
            public void onSwipeLeft() {
                vote("0");
                if(((MainActivity) getActivity()).isLoggedin()) {
                    Snackbar.make(getView().findViewById(R.id.memeview), "Downvoted", Snackbar.LENGTH_LONG)
                            .setAction("Action", null).show();
                }
                getRequest();
            }
            public void onSwipeBottom() {
                direction = "false";
                Snackbar.make(getView().findViewById(R.id.memeview), "Crippling depression", Snackbar.LENGTH_LONG)
                        .setAction("Action", null).show();
            }
        });
        if(((MainActivity) getActivity()).getToken()==""){
            initSession();
        } else {
            getRequest();
        }
    }

    public void initSession(){
        RequestQueue requestQueue = Volley.newRequestQueue(getActivity());
        String url = "http://10.0.2.2:3000/user/session";
        JsonObjectRequest getRequest = new JsonObjectRequest(Request.Method.GET, url, null,
                new Response.Listener<JSONObject>()
                {
                    @Override
                    public void onResponse(JSONObject response) {
                        try {
                            token=response.getString("token");
                            ((MainActivity) getActivity()).setToken(token);
                            System.out.println("HIER IS DE GVD TOKEN:"+token);
                            getRequest();
                        } catch (JSONException e){
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener()
                {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        VolleyLog.e("Error: ", error.getMessage());
                    }
                }
        );

// add it to the RequestQueue
        requestQueue.add(getRequest);
    }

    public void vote(String type){
        try{
            token = ((MainActivity) getActivity()).getToken();
            System.out.println("WIJZE KEUZE: " + token);
        } catch (Exception e){
            System.out.println("Helaas pindakaas.");
        }
        if(((MainActivity) getActivity()).isLoggedin()){
            RequestQueue requestQueue = Volley.newRequestQueue(getActivity());
            final String URL = "http://10.0.2.2:3000/vote";
            // Post params to be sent to the server
            HashMap<String, String> params = new HashMap<String, String>();
            params.put("token", token);
            params.put("postId", postId);
            params.put("upvote", type);

            JsonObjectRequest req = new JsonObjectRequest(URL, new JSONObject(params),
                    new Response.Listener<JSONObject>() {
                        @Override
                        public void onResponse(JSONObject response) {
                            try {
                                token = ((MainActivity) getActivity()).getToken();
                                VolleyLog.v("Response:%n %s", response.toString(4));

                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                    }, new Response.ErrorListener() {
                @Override
                public void onErrorResponse(VolleyError error) {
                    VolleyLog.e("Error: ", error.getMessage());
                }
            });
            requestQueue.add(req);
        }
    }
    public void doRecentSearch(){

    }

    public void getRequest(){
        String randompostURL;

            randompostURL = "http://10.0.2.2:3000/randompost";
            System.out.println("we zitten nou in de hete palen");

            // Creates the Volley request queue
            requestQueue = Volley.newRequestQueue(getActivity());

            // Casts results into the TextView found within the main layout XML with id jsonData
            results = (TextView) getView().findViewById(R.id.text);
            imgResult = (ImageView) getView().findViewById(R.id.memeview);
            points = (TextView) getView().findViewById(R.id.pointLabel);
        final TextView catView = (TextView) getView().findViewById(R.id.catView);


            // Creating the JsonArrayRequest class called arrayreq, passing the required parameters
            //JsonURL is the URL to be fetched from
            JsonObjectRequest jsObjRequest = new JsonObjectRequest
                    (Request.Method.GET, randompostURL, null, new Response.Listener<JSONObject>() {

                        @Override
                        public void onResponse(JSONObject response) {
                            try {
                                results.setText("Response: " + response.toString());
                                results.setText(response.getString("title"));
                                int upvotes = Integer.parseInt(response.getString("upvotes"));
                                int downvotes = Integer.parseInt(response.getString("downvotes"));
                                postId = response.getString("id");
                                points.setText(upvotes - downvotes + " Points");
                                Animation myFadeInAnimation = AnimationUtils.loadAnimation(getActivity().getApplicationContext(), R.anim.fadein);
                                imgResult.startAnimation(myFadeInAnimation); //Set animation to your ImageView
                                new DownloadImageTask((ImageView) getView().findViewById(R.id.memeview))
                                        .execute("http://10.0.2.2:3000/img/" + response.getString("id"));


                            } catch (Exception ex) {
                                ex.printStackTrace();
                                results.setText("Je bent bij het einde van de maymays, gefeliciteerd!!1!1!");
                                new DownloadImageTask((ImageView) getView().findViewById(R.id.memeview))
                                        .execute("http://10.0.2.2:3000/img/end");
                                points.setText("∞ points");
                                catView.setText("Such end much dead");
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
